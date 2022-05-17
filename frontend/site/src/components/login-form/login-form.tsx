import React, { useCallback, FC } from 'react';
import { Form, FormSpy } from 'react-final-form';
import cn from 'classnames';

import { loginUser } from 'actions/user';
import { setLoginForm } from 'actions/login-form';
import { useSelector } from 'store/store';
import { Button } from 'components/button';
import { TextField } from 'components/fields';
import { emailValidate, requiredValidate } from 'utils/final-forms';
import { FetchStatus } from 'types/index';
import Spinner from 'assets/spinner.svg';

import type { ILoginFormProps, IFormSpy } from './login-form.typings';

import styles from './style.scss';

export const LoginForm: FC = () => {
    const loginFormStore = useSelector((root) => root.loginForm);
    const isSubmitDisable =
        loginFormStore.fetchStatus === FetchStatus.loading ||
        !!loginFormStore.loginOrEmailError ||
        !!loginFormStore.passwordError;

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

        loginUser(user);
    }, []);

    const formValidate = useCallback(() => {
        if (loginFormStore.loginOrEmailError) {
            return {
                'email-username': loginFormStore.loginOrEmailError,
            };
        }

        if (loginFormStore.passwordError) {
            return {
                password: loginFormStore.passwordError,
            };
        }

        return {};
    }, [loginFormStore.loginOrEmailError, loginFormStore.passwordError]);

    const modifiedSinceLastSubmit = useCallback(
        (spyValue: IFormSpy) => {
            if (spyValue.modifiedSinceLastSubmit) {
                if (
                    loginFormStore.loginOrEmailError &&
                    spyValue.dirtyFieldsSinceLastSubmit['email-username'] === true
                ) {
                    setLoginForm('', 'loginOrEmailError');
                }

                if (loginFormStore.passwordError && spyValue.dirtyFieldsSinceLastSubmit.password === true) {
                    setLoginForm('', 'passwordError');
                }
            }
        },
        [loginFormStore.loginOrEmailError, loginFormStore.passwordError],
    );

    return (
        <div className={styles.loginFrom}>
            <Form
                onSubmit={onSubmit}
                validate={formValidate}
                render={({ handleSubmit }) => (
                    <form onSubmit={handleSubmit}>
                        <div className={styles.fields}>
                            <TextField
                                name="email-username"
                                type="email-username"
                                title="логин"
                                validators={[requiredValidate]}
                                isDisable={loginFormStore.fetchStatus === FetchStatus.loading}
                            />
                            <TextField
                                name="password"
                                type="password"
                                title="пароль"
                                validators={[requiredValidate]}
                                isDisable={loginFormStore.fetchStatus === FetchStatus.loading}
                            />

                            <Button text={'войти'} type={'submit'} isDisable={isSubmitDisable} />

                            <FormSpy
                                subscription={{ dirtyFieldsSinceLastSubmit: true, modifiedSinceLastSubmit: true }}
                                onChange={modifiedSinceLastSubmit}
                            />

                            <div
                                className={cn(
                                    styles.spinner,
                                    loginFormStore.fetchStatus === FetchStatus.loading && styles.loading,
                                )}
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
