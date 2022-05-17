import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Field, Form, FormSpy, useForm } from 'react-final-form';
import { useSelector } from 'store';
import cn from 'classnames';

import { Badge, BadgeColors, RWAtobadgeColor } from 'components/badge';
import { FetchStatus, RWA } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { CheckboxField, TextField } from 'components/fields';
import { Button } from 'components/button';
import { deleteExtraSpaces, entityNameValidator, requiredValidate } from 'utils/final-forms';
import { useBooleanState } from 'hooks';
import { noop } from 'utils/noop';
import { changeGroup } from 'actions/map-settings-page';
import { MapNameStatus } from 'store/reducers/map-settings-page';
import { checkIsMapNameFree } from 'actions/map-settings-page';

import styles from './style.scss';

export const MainSettings: FC = () => {
    const { map, mapFetchStatus, newTitleFetchStatus, newPrivateFetchStatus, mapNameStatus } = useSelector(
        (root) => root.mapSettingsPage,
    );
    const { userId } = useSelector((root) => root.user);
    const [busyNameError, setBuzyNameErrorTrue, setBuzyNameErrorFalse] = useBooleanState(false);
    const [lastMapName, setLastMapName] = useState('');
    const isLoadingMap = mapFetchStatus === FetchStatus.loading;
    const isNoneMap = mapFetchStatus === FetchStatus.none;
    const isLoadingNewTitle = newTitleFetchStatus === FetchStatus.loading;
    const isLoadingNewPrivate = newPrivateFetchStatus === FetchStatus.loading;
    const isSubmitNewTitleDisable =
        mapNameStatus.status === MapNameStatus.notChecked || mapNameStatus.status === MapNameStatus.busy;

    const badges = useMemo(
        () =>
            [
                {
                    title: `by ${map?.userId === userId ? 'you' : map?.username}`,
                    color: BadgeColors.white,
                },
                {
                    title: (map?.access == RWA.none ? 'no access' : map?.access) ?? '',
                    color: RWAtobadgeColor(map?.access ?? RWA.none),
                },
                map?.isPrivate
                    ? {
                          title: 'приватная',
                          color: BadgeColors.red,
                      }
                    : undefined,
            ].filter(Boolean),
        [map?.userId, map?.username, map?.access, map?.isPrivate, userId],
    );

    const noBusyNameValidator = useCallback(
        (value: string) => {
            if (mapNameStatus.status === MapNameStatus.busy && lastMapName === value) {
                return 'карта с таким названием уже существует';
            }

            return undefined;
        },
        [lastMapName, mapNameStatus],
    );

    const handleMapNameBlur = useCallback(
        (isError: boolean, event: React.FocusEvent<HTMLInputElement, Element>) => {
            if (!isError && event.target.value !== lastMapName && event.target.value !== map?.title) {
                checkIsMapNameFree({ title: event.target.value });
                setLastMapName(event.target.value);
            }
        },
        [lastMapName, map?.title],
    );

    const handleFormSubmit = useCallback(({ title }: { title: string }) => {
        changeGroup({ newTitle: title });
    }, []);

    const handlePrivateChange = useCallback((isPrivate: boolean) => {
        changeGroup({ newPrivate: isPrivate });
    }, []);

    useEffect(() => {
        if (mapNameStatus.status === MapNameStatus.busy) {
            setBuzyNameErrorTrue();
        } else {
            setBuzyNameErrorFalse();
        }
    }, [mapNameStatus.status]);

    return (
        <div className={styles.mainSettings}>
            <div className={cn(styles.content, !isLoadingMap && !isNoneMap && styles.show)}>
                {map && (
                    <Form onSubmit={handleFormSubmit}>
                        {({ values, errors, handleSubmit }) => (
                            <div className={cn(styles.title, isLoadingNewTitle && styles.disable)}>
                                <TextField
                                    name="title"
                                    type="text"
                                    defaultValue={map?.title}
                                    title={'Название карты'}
                                    validators={[requiredValidate, entityNameValidator, noBusyNameValidator]}
                                    isInstantlyValidate
                                    onBlur={(e) => handleMapNameBlur(!!errors?.title, e)}
                                />
                                <div
                                    className={cn(
                                        styles.mapNameSpinner,
                                        mapNameStatus.fetchStatus === FetchStatus.loading && styles.loading,
                                    )}
                                >
                                    <SpinnerIcon />
                                </div>
                                <div className={styles.applyButton}>
                                    <Button
                                        text="применить"
                                        isDisable={
                                            map.title === deleteExtraSpaces(values.title ?? '') ||
                                            errors?.title ||
                                            isLoadingNewTitle ||
                                            isSubmitNewTitleDisable
                                        }
                                        onClick={handleSubmit}
                                    />
                                </div>
                                <div className={cn(styles.spinner, isLoadingNewTitle && styles.show)}>
                                    <SpinnerIcon />
                                </div>
                                <ErrorFieldSpy busyNameError={busyNameError} />
                            </div>
                        )}
                    </Form>
                )}
                {map && (
                    <Form onSubmit={noop}>
                        {() => (
                            <>
                                <div className={cn(styles.private, isLoadingNewPrivate && styles.disable)}>
                                    <CheckboxField
                                        name="private"
                                        title="приватная"
                                        defaultValue={map.isPrivate}
                                        isNoNeedErroText
                                    />
                                    <div className={cn(styles.spinner, isLoadingNewPrivate && styles.show)}>
                                        <SpinnerIcon />
                                    </div>
                                </div>
                                <FormSpy
                                    subscription={{ values: true }}
                                    onChange={({ values }) => {
                                        if (map.isPrivate !== values.private) {
                                            handlePrivateChange(values.private);
                                        }
                                    }}
                                    children={<></>}
                                />
                            </>
                        )}
                    </Form>
                )}
                <div className={styles.badges}>{badges.map((badge, i) => badge && <Badge {...badge} key={i} />)}</div>
            </div>
            <div className={cn(styles.spinner, (isLoadingMap || isNoneMap) && styles.show)}>
                <SpinnerIcon />
            </div>
        </div>
    );
};

const ErrorFieldSpy: FC<{ busyNameError: boolean }> = ({ busyNameError }) => {
    const name = 'title-force-validation';
    const form = useForm();

    useEffect(() => {
        form.change(name, busyNameError ? undefined : '123');
    }, [busyNameError]);

    return <Field name={name} validate={requiredValidate} children={() => <></>} initialValue={'123'} />;
};
