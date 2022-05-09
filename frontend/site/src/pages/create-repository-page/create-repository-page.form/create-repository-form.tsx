import React, { useCallback, FC, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, Form, FormSpy, useForm } from 'react-final-form';
import cn from 'classnames';

import { FetchStatus } from 'types/index';
import { getRepository } from 'constants/routers';
import { checkIsRepositoryNameFree, createRepository, setRepositoryNameNotChecked } from 'actions/repositories';
import { useBooleanState } from 'hooks';
import { useSelector } from 'store/store';
import { Button } from 'components/button';
import { TextField, CheckboxField } from 'components/fields';
import { requiredValidate } from 'utils/final-forms';
import { RepositoryNameStatus } from 'store/reducers/create-repository-form';

import Spinner from 'assets/spinner.svg';

import styles from './style.scss';

export const CreateRepositoryForm: FC = () => {
    const { repositoryNameStatus, fetchStatus } = useSelector((root) => root.createRepositoryForm);
    const { username } = useSelector((root) => root.user);
    const [lastRepositoryName, setLastRepositoryName] = useState<string>('');
    const [busyNameError, setBuzyNameErrorTrue, setBuzyNameErrorFalse] = useBooleanState(false);
    const navigate = useNavigate();

    const isSubmitDisable =
        fetchStatus === FetchStatus.loading ||
        repositoryNameStatus.status === RepositoryNameStatus.notChecked ||
        repositoryNameStatus.status === RepositoryNameStatus.busy;

    const handleSubmit = useCallback(
        (userForm: { title: string; isPrivate: boolean }) => {
            if (isSubmitDisable) {
                return;
            }

            createRepository(userForm).then((repository) => {
                if (repository) {
                    navigate(getRepository(username, String(repository.id)));
                }
            });
        },
        [navigate, username, isSubmitDisable],
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
        (event: React.FocusEvent<HTMLInputElement, Element>) => {
            if (event.target.value !== lastRepositoryName) {
                checkIsRepositoryNameFree({ title: event.target.value });
                setLastRepositoryName(event.target.value);
            }
        },
        [lastRepositoryName],
    );

    useEffect(() => {
        if (repositoryNameStatus.status === RepositoryNameStatus.busy) {
            setBuzyNameErrorTrue();
        } else {
            setBuzyNameErrorFalse();
        }
    }, [repositoryNameStatus.status]);

    return (
        <div className={styles.createRepositoryFrom}>
            <Form
                onSubmit={handleSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className={styles.field}>
                                <TextField
                                    name="title"
                                    type="text"
                                    title="Название репозитория"
                                    validators={[requiredValidate, noBusyNameValidator]}
                                    isDisable={fetchStatus === FetchStatus.loading}
                                    onBlur={handleRepositoryNameBlur}
                                />
                                <div
                                    className={cn(
                                        styles.repositoryNameSpinner,
                                        repositoryNameStatus.fetchStatus === FetchStatus.loading && styles.loading,
                                    )}
                                >
                                    <Spinner />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <CheckboxField
                                    name="isPrivate"
                                    title="сделать приватным"
                                    isDisable={fetchStatus === FetchStatus.loading}
                                />
                            </div>
                            <ErrorFieldSpy busyNameError={busyNameError} />
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.button}>
                                <Button text={'Создать'} type={'submit'} isDisable={isSubmitDisable} />
                            </div>
                        </div>
                        <div className={cn(styles.spinner, fetchStatus === FetchStatus.loading && styles.loading)}>
                            <Spinner />
                        </div>
                        <FormSpy
                            subscription={{ values: true }}
                            children={({ values }) => {
                                if (
                                    values.title !== lastRepositoryName &&
                                    repositoryNameStatus.status !== RepositoryNameStatus.notChecked
                                ) {
                                    setRepositoryNameNotChecked();
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

const ErrorFieldSpy: FC<{ busyNameError: boolean }> = ({ busyNameError }) => {
    const name = 'title-force-validation';
    const form = useForm();

    useEffect(() => {
        form.change(name, busyNameError ? undefined : '123');
    }, [busyNameError]);

    return <Field name={name} validate={requiredValidate} children={() => <></>} initialValue={'123'} />;
};
