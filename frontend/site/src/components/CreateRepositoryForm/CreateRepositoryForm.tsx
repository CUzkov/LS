import React, { useCallback, FC, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { Form } from 'react-final-form';

import { FetchStatus } from 'types/index';
import { getRepository } from 'constants/routers';
import { checkIsRepositoryNameFree, createRepository } from 'actions/repositories';
import { useDispatch, useSelector } from 'store/store';
import { TextField, Button, CheckboxField } from 'small-components/index';
import { reuqiredValidate } from 'utils/final-forms';
import { RepositoryNameStatuses } from 'store/reducers/create-repository-form';

import Spinner from 'assets/spinner.svg';

import styles from './style.scss';

export const CreateRepositoryForm: FC = () => {
    const dispatch = useDispatch();
    const store = useSelector((root) => root.createRepositoryForm);
    const { username } = useSelector((root) => root.user);
    const [lastRepositoryName, setLastRepositoryName] = useState<string>('');
    const navigate = useNavigate();

    const handleSubmit = useCallback(
        (userForm: { title: string; isPrivate: boolean }) => {
            createRepository(dispatch, userForm).then((repository) => {
                if (repository) {
                    navigate(getRepository(username, String(repository.id)));
                }
            });
        },
        [navigate, username],
    );

    const formValidate = useCallback(
        (values: { title: string; isPrivate: boolean }) => {
            const errors = {};

            if (
                store.repositoryNameStatus.status === RepositoryNameStatuses.busy &&
                lastRepositoryName === values.title
            ) {
                errors['title'] = 'Репозиторий с таким названием уже существует';
            }

            return errors;
        },
        [store],
    );

    const handleRepositoryNameBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement, Element>) => {
            if (event.target.value !== lastRepositoryName) {
                checkIsRepositoryNameFree(dispatch, { title: event.target.value });
                setLastRepositoryName(event.target.value);
            }
        },
        [lastRepositoryName],
    );

    const isSubmitDisable =
        store.fetchStatus === FetchStatus.loading ||
        store.repositoryNameStatus.status === RepositoryNameStatuses.notChecked ||
        store.repositoryNameStatus.status === RepositoryNameStatuses.busy;

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
                                    validators={[reuqiredValidate]}
                                    isDisable={store.fetchStatus === FetchStatus.loading}
                                    onBlur={handleRepositoryNameBlur}
                                />
                                <div
                                    className={cn(
                                        styles.repositoryNameSpinner,
                                        store.repositoryNameStatus.fetchStatus === FetchStatus.loading &&
                                            styles.loading,
                                    )}
                                >
                                    <Spinner />
                                </div>
                            </div>
                            <div className={styles.field}>
                                <CheckboxField
                                    name="isPrivate"
                                    title="сделать приватным"
                                    isDisable={store.fetchStatus === FetchStatus.loading}
                                />
                            </div>
                        </div>
                        <div className={styles.buttonWrapper}>
                            <div className={styles.button}>
                                <Button text={'Создать'} type={'submit'} isDisable={isSubmitDisable} />
                            </div>
                        </div>
                        <div
                            className={cn(styles.spinner, store.fetchStatus === FetchStatus.loading && styles.loading)}
                        >
                            <Spinner />
                        </div>
                    </form>
                )}
            />
        </div>
    );
};
