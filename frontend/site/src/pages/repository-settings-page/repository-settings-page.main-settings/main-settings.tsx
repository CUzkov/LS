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
import { changeRepository } from 'actions/repository-settings-page';
import { RepositoryNameStatus } from 'store/reducers/repository-settings-page';
import { checkIsRepositoryNameFree } from 'actions/repository-settings-page';

import styles from './style.scss';

export const MainSettings: FC = () => {
    const { repository, repositoryFetchStatus, newTitleFetchStatus, newPrivateFetchStatus, repositoryNameStatus } =
        useSelector((root) => root.repositorySettingsPage);
    const { userId } = useSelector((root) => root.user);
    const [busyNameError, setBuzyNameErrorTrue, setBuzyNameErrorFalse] = useBooleanState(false);
    const [lastRepositoryName, setLastRepositoryName] = useState('');
    const isLoadingRepository = repositoryFetchStatus === FetchStatus.loading;
    const isNoneRepository = repositoryFetchStatus === FetchStatus.none;
    const isLoadingNewTitle = newTitleFetchStatus === FetchStatus.loading;
    const isLoadingNewPrivate = newPrivateFetchStatus === FetchStatus.loading;
    const isSubmitNewTitleDisable =
        repositoryNameStatus.status === RepositoryNameStatus.notChecked ||
        repositoryNameStatus.status === RepositoryNameStatus.busy;

    const badges = useMemo(
        () =>
            [
                {
                    title: `by ${repository?.userId === userId ? 'you' : repository?.username}`,
                    color: BadgeColors.white,
                },
                {
                    title: (repository?.access == RWA.none ? 'no access' : repository?.access) ?? '',
                    color: RWAtobadgeColor(repository?.access ?? RWA.none),
                },
                repository?.isPrivate
                    ? {
                          title: 'приватный',
                          color: BadgeColors.red,
                      }
                    : undefined,
            ].filter(Boolean),
        [repository?.userId, repository?.username, repository?.access, repository?.isPrivate, userId],
    );

    const noBusyNameValidator = useCallback(
        (value: string) => {
            if (repositoryNameStatus.status === RepositoryNameStatus.busy && lastRepositoryName === value) {
                return 'репозиторий с таким названием уже существует';
            }

            return undefined;
        },
        [lastRepositoryName, repositoryNameStatus],
    );

    const handleRepositoryNameBlur = useCallback(
        (isError: boolean, event: React.FocusEvent<HTMLInputElement, Element>) => {
            if (!isError && event.target.value !== lastRepositoryName && event.target.value !== repository?.title) {
                checkIsRepositoryNameFree({ title: event.target.value });
                setLastRepositoryName(event.target.value);
            }
        },
        [lastRepositoryName, repository?.title],
    );

    const handleFormSubmit = useCallback(({ title }: { title: string }) => {
        changeRepository({ newTitle: title });
    }, []);

    const handlePrivateChange = useCallback((isPrivate: boolean) => {
        changeRepository({ newPrivate: isPrivate });
    }, []);

    useEffect(() => {
        if (repositoryNameStatus.status === RepositoryNameStatus.busy) {
            setBuzyNameErrorTrue();
        } else {
            setBuzyNameErrorFalse();
        }
    }, [repositoryNameStatus.status]);

    return (
        <div className={styles.mainSettings}>
            <div className={cn(styles.content, !isLoadingRepository && !isNoneRepository && styles.show)}>
                {repository && (
                    <Form onSubmit={handleFormSubmit}>
                        {({ values, errors, handleSubmit }) => (
                            <div className={cn(styles.title, isLoadingNewTitle && styles.disable)}>
                                <TextField
                                    name="title"
                                    type="text"
                                    defaultValue={repository?.title}
                                    title={'Название репозитория'}
                                    validators={[requiredValidate, entityNameValidator, noBusyNameValidator]}
                                    isInstantlyValidate
                                    onBlur={(e) => handleRepositoryNameBlur(!!errors?.title, e)}
                                />
                                <div
                                    className={cn(
                                        styles.repositoryNameSpinner,
                                        repositoryNameStatus.fetchStatus === FetchStatus.loading && styles.loading,
                                    )}
                                >
                                    <SpinnerIcon />
                                </div>
                                <div className={styles.applyButton}>
                                    <Button
                                        text="применить"
                                        isDisable={
                                            repository.title === deleteExtraSpaces(values.title ?? '') ||
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
                {repository && (
                    <Form onSubmit={noop}>
                        {() => (
                            <>
                                <div className={cn(styles.private, isLoadingNewPrivate && styles.disable)}>
                                    <CheckboxField
                                        name="private"
                                        title="приватный"
                                        defaultValue={repository.isPrivate}
                                        isNoNeedErroText
                                    />
                                    <div className={cn(styles.spinner, isLoadingNewPrivate && styles.show)}>
                                        <SpinnerIcon />
                                    </div>
                                </div>
                                <FormSpy
                                    subscription={{ values: true }}
                                    onChange={({ values }) => {
                                        if (repository.isPrivate !== values.private) {
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
            <div className={cn(styles.spinner, (isLoadingRepository || isNoneRepository) && styles.show)}>
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
