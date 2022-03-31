import React, { useCallback } from 'react';
import type { FC } from 'react';
import { Form } from 'react-final-form';

import { createMap } from 'actions/maps';
import { useDispatch, useSelector } from 'store/store';
import {
    cnCreateMapForm,
    cnCreateMapFormFields,
    cnCreateMapFormSpinner,
    cnCreateMapFormButton,
    cnCreateMapFormField,
} from './CreateMapForm.constants';
import { TextField, Button } from 'small-components/index';
import { requiredValidate } from 'utils/final-forms';
import type { ICreateMapProps } from './CreateMapForm.typings';
import { FetchStatus } from 'types/index';

import Spinner from 'assets/spinner.svg';

import './style.scss';

export const CreateMapForm: FC = () => {
    const dispatch = useDispatch();
    const createMapFormStore = useSelector((root) => root.createMapForm);

    const onSubmit = useCallback((userForm: ICreateMapProps) => {
        createMap(dispatch, userForm);
    }, []);

    return (
        <div className={cnCreateMapForm}>
            <Form
                onSubmit={onSubmit}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={cnCreateMapFormFields}>
                            <div className={cnCreateMapFormField}>
                                <TextField
                                    name="title"
                                    type="text"
                                    title="Название карты"
                                    validators={[requiredValidate]}
                                    isDisable={createMapFormStore.fetchStatus === FetchStatus.loading}
                                />
                            </div>
                        </div>
                        <div className={cnCreateMapFormButton}>
                            <Button
                                text={'Создать'}
                                type={'submit'}
                                isDisable={createMapFormStore.fetchStatus === FetchStatus.loading}
                            />
                        </div>
                        <div
                            className={cnCreateMapFormSpinner({
                                loading: createMapFormStore.fetchStatus === FetchStatus.loading,
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
