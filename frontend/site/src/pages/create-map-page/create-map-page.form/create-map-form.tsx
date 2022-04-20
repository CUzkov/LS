import React, { useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';
import { Field, Form, FormSpy, useForm } from 'react-final-form';
import cn from 'classnames';
import { useNavigate } from 'react-router-dom';

import { useSelector } from 'store/store';
import { checkIsMapNameFree, createMap, setMapNameNotChecked } from 'actions/create-map-page';
import { TextField, Button } from 'small-components/index';
import { requiredValidate } from 'utils/final-forms';
import { MapNameStatus } from 'store/reducers/create-map-form';
import { FetchStatus, GroupType } from 'types/index';
import { useBooleanState } from 'hooks';
import { getMap } from 'constants/routers';
import Spinner from 'assets/spinner.svg';

import styles from './style.scss';

export const CreateMapForm: FC = () => {
    const { mapNameStatus, fetchStatus } = useSelector((root) => root.createMapForm);
    const { username } = useSelector((root) => root.user);
    const [busyNameError, setBuzyNameErrorTrue, setBuzyNameErrorFalse] = useBooleanState(false);
    const [lastMapName, setlastMapName] = useState<string>('');
    const navigate = useNavigate();

    const isSubmitDisable =
        fetchStatus === FetchStatus.loading ||
        mapNameStatus.status === MapNameStatus.notChecked ||
        mapNameStatus.status === MapNameStatus.busy;

    const handleSubmit = useCallback(
        (userForm: { title: string; isPrivate: boolean }) => {
            if (isSubmitDisable) {
                return;
            }

            createMap(userForm.title).then((map) => {
                if (map) {
                    navigate(getMap(username, String(map.id)))
                }
            })
        },
        [navigate, username, isSubmitDisable],
    );

    const noBusyNameValidator = useCallback((value: string) => {
        if (mapNameStatus.status === MapNameStatus.busy && lastMapName === value) {
            return 'карта с таким названием уже существует';
        }

        return undefined;
    }, [lastMapName, mapNameStatus]);

    const handleRepositoryNameBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement, Element>) => {
            if (event.target.value !== lastMapName) {
                checkIsMapNameFree(event.target.value)
                setlastMapName(event.target.value);
            }
        },
        [lastMapName],
    );

    useEffect(() => {
        if (mapNameStatus.status === MapNameStatus.busy) {
            setBuzyNameErrorTrue()
        } else {
            setBuzyNameErrorFalse();
        }
    }, [mapNameStatus.status])

    return (
        <div className={styles.createMapFrom}>
            <Form
                onSubmit={handleSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className={styles.field}>
                                <TextField
                                    name="title"
                                    type="text"
                                    title="Название карты"
                                    validators={[requiredValidate, noBusyNameValidator]}
                                    isDisable={fetchStatus === FetchStatus.loading}
                                    onBlur={handleRepositoryNameBlur}
                                />
                                <div
                                    className={cn(
                                        styles.mapTitleSpinner,
                                        mapNameStatus.fetchStatus === FetchStatus.loading && styles.loading,
                                    )}
                                >
                                    <Spinner />
                                </div>
                            </div>
                        </div>
                        <div className={styles.submitButtonWrapper}>
                            <div className={styles.submitButton}>
                                <Button
                                    text={'Создать'}
                                    type={'submit'}
                                    isDisable={isSubmitDisable}
                                />
                            </div>
                        </div>
                        <div className={cn(styles.spinner, fetchStatus === FetchStatus.loading && styles.loading)}>
                            <Spinner />
                        </div>
                        <ErrorFieldSpy busyNameError={busyNameError} />
                        <FormSpy
                            subscription={{ values: true }}
                            children={({ values }) => {
                                if (
                                    values.title !== lastMapName &&
                                    mapNameStatus.status !== MapNameStatus.notChecked
                                ) {
                                    setMapNameNotChecked();
                                }
                                return null;
                            }}
                        />
                    </form>
                )}
            />
        </div>
    );
};

const ErrorFieldSpy: FC<{busyNameError: boolean}> = ({busyNameError}) => {
    const name = 'title-force-validation';
    const form = useForm();

    useEffect(() => {
        form.change(name, busyNameError ? undefined : '123')
    }, [busyNameError])

    return <Field name={name} validate={requiredValidate} children={() => <></>} initialValue={'123'} />;
}
