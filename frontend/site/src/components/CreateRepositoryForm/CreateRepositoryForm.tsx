import React, { useCallback, FC, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';

import { FetchStatus } from 'types/index';
import { IFormSpy } from './CreateRepositoryForm.typings';
import { checkIsRepositoryNameFree, createRepository, INewRepositoryProps } from 'actions/repositories';
import { useDispatch, useSelector } from 'store/store';
import {
    cnCreateRepositoryForm,
    cnButton,
    cnField,
    cnFields,
    cnSpinner,
    cnRepositoryNameSpinner,
} from './CreateRepositoryForm.constants';
import { TextField, Button, CheckboxField } from 'small-components/index';
import { reuqiredValidate } from 'utils/final-forms';
import { RepositoryNameStatuses } from 'store/reducers/create-repository-form';

import Spinner from 'assets/spinner.svg';

import './style.scss';

export const CreateRepositoryForm: FC = () => {
    const dispatch = useDispatch();
    const store = useSelector((root) => root.createRepositoryForm);
    const [lastRepositoryName, setLastRepositoryName] = useState<string>('');

    const handleSubmit = useCallback((userForm: INewRepositoryProps) => {
        createRepository(dispatch, userForm);
    }, []);

    const formValidate = useCallback(
        (values: INewRepositoryProps) => {
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

    const modifiedSinceLastSubmit = useCallback((_: IFormSpy) => {}, [store.error]);

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
        store.error !== '' ||
        store.repositoryNameStatus.status === RepositoryNameStatuses.notChecked ||
        store.repositoryNameStatus.status === RepositoryNameStatuses.busy;

    return (
        <div className={cnCreateRepositoryForm}>
            <Form
                onSubmit={handleSubmit}
                validate={formValidate}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={cnFields}>
                            <div className={cnField}>
                                <TextField
                                    name="title"
                                    type="text"
                                    title="Название репозитория"
                                    validators={[reuqiredValidate]}
                                    isDisable={store.fetchStatus === FetchStatus.loading}
                                    onBlur={handleRepositoryNameBlur}
                                />
                                <div
                                    className={cnRepositoryNameSpinner({
                                        loading: store.repositoryNameStatus.fetchStatus === FetchStatus.loading,
                                    })}
                                >
                                    <Spinner />
                                </div>
                            </div>
                            <div className={cnField}>
                                <CheckboxField
                                    name="is_private"
                                    title="сделать приватным"
                                    isDisable={store.fetchStatus === FetchStatus.loading}
                                />
                            </div>

                            <FormSpy
                                subscription={{ dirtyFieldsSinceLastSubmit: true, modifiedSinceLastSubmit: true }}
                                onChange={modifiedSinceLastSubmit}
                            />
                        </div>
                        <div className={cnButton}>
                            <Button text={'Создать'} type={'submit'} isDisable={isSubmitDisable} />
                        </div>
                        <div
                            className={cnSpinner({
                                loading: store.fetchStatus === FetchStatus.loading,
                            })}
                        >
                            <Spinner />
                        </div>
                    </form>
                )}
            />
        </div>
    );
};
