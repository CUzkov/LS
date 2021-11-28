import React, { useCallback } from 'react';
import type { FC } from 'react';
import { Form, FormSpy } from 'react-final-form';

import { loginUser } from 'actions/user';
import { setLoginForm } from 'actions/loginForm';
import { useDispatch, useSelector } from 'store/store';
import { cnLoginFrom, cnLoginFromFields, cnLoginFromSpinner } from './LoginForm.constants';
import { TextField, Button } from 'small-components/index';
import { emailValidate, reuqiredValidate } from 'utils/final-forms';
import type { ILoginFormProps, IFormSpy } from './LoginForm.typings';
import { NO_SUCH_USER, INCORRECT_PASSWORD } from 'store/reducers/loginForm';
import { FetchStatus } from 'types/index';

import Spinner from 'assets/spinner.svg';

import './style.scss';

export const LoginForm: FC = () => {
    const dispatch = useDispatch();
    const loginFormStore = useSelector((root) => root.loginForm);

    const onSubmit = useCallback((userForm: ILoginFormProps) => {
        const isEmail = emailValidate(userForm['email-username']);

        const user = {
            email: '',
            username: '',
            password: userForm.password,
        };

        if (isEmail === undefined) {
            user.email = userForm['email-username'];
        } else {
            user.username = userForm['email-username'];
        }

        loginUser(dispatch, user);
    }, []);

    const formValidate = useCallback(() => {
        if (loginFormStore.error !== '' && loginFormStore.error !== undefined && loginFormStore.error !== null) {
            if (loginFormStore.error === NO_SUCH_USER) {
                return {
                    'email-username': NO_SUCH_USER,
                };
            }

            if (loginFormStore.error === INCORRECT_PASSWORD) {
                return {
                    password: INCORRECT_PASSWORD,
                };
            }
        }

        return {};
    }, [loginFormStore.error]);

    const modifiedSinceLastSubmit = useCallback(
        (spyValue: IFormSpy) => {
            if (spyValue.modifiedSinceLastSubmit) {
                if (
                    loginFormStore.error === NO_SUCH_USER &&
                    spyValue.dirtyFieldsSinceLastSubmit['email-username'] === true
                ) {
                    setLoginForm(dispatch, '');
                }

                if (
                    loginFormStore.error === INCORRECT_PASSWORD &&
                    spyValue.dirtyFieldsSinceLastSubmit.password === true
                ) {
                    setLoginForm(dispatch, '');
                }
            }
        },
        [loginFormStore.error],
    );

    return (
        <div className={cnLoginFrom}>
            <Form
                onSubmit={onSubmit}
                validate={formValidate}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={cnLoginFromFields}>
                            <TextField
                                name="email-username"
                                type="email-username"
                                title="Логин"
                                validators={[reuqiredValidate]}
                                isDisable={loginFormStore.fetchStatus === FetchStatus.loading}
                            />
                            <TextField
                                name="password"
                                type="password"
                                title="Пароль"
                                validators={[reuqiredValidate]}
                                isDisable={loginFormStore.fetchStatus === FetchStatus.loading}
                            />

                            <Button
                                text={'Войти'}
                                type={'submit'}
                                isDisable={
                                    loginFormStore.fetchStatus === FetchStatus.loading || loginFormStore.error !== ''
                                }
                            />

                            <FormSpy
                                subscription={{ dirtyFieldsSinceLastSubmit: true, modifiedSinceLastSubmit: true }}
                                onChange={modifiedSinceLastSubmit}
                            />

                            <div
                                className={cnLoginFromSpinner({
                                    loading: loginFormStore.fetchStatus === FetchStatus.loading,
                                })}
                            >
                                <Spinner />
                            </div>
                        </div>
                    </form>
                )}
            />
        </div>
    );
};
