import React, { useCallback, FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { Form, FormSpy } from 'react-final-form';

import { FetchStatus } from 'types/index';
import { getRepository } from 'constants/routers';
import { checkIsRepositoryNameFree, createRepository, setRepositoryNameNotChecked } from 'actions/repositories';
import { useSelector } from 'store/store';
import { TextField, Button, CheckboxField } from 'small-components/index';
import { requiredValidate } from 'utils/final-forms';
import { RepositoryNameStatus } from 'store/reducers/create-repository-form';

import Spinner from 'assets/spinner.svg';

import styles from './style.scss';

export const CreateRepositoryForm: FC = () => {
    const { repositoryNameStatus, fetchStatus } = useSelector((root) => root.createRepositoryForm);
    const { username } = useSelector((root) => root.user);
    const [lastRepositoryName, setLastRepositoryName] = useState<string>('');
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

    const formValidate = useCallback(
        (values: { title: string; isPrivate: boolean }) => {
            const errors = {};

            if (repositoryNameStatus.status === RepositoryNameStatus.busy && lastRepositoryName === values.title) {
                errors['title'] = 'Репозиторий с таким названием уже существует';
            }

            return errors;
        },
        [repositoryNameStatus, lastRepositoryName],
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

    return (
        <div className={styles.createRepositoryFrom}>
            <Form
                onSubmit={handleSubmit}
                validate={formValidate}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <div className={styles.field}>
                                <TextField
                                    name="title"
                                    type="text"
                                    title="Название репозитория"
                                    validators={[requiredValidate]}
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
