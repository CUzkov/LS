import { CheckAuthRD } from '@api-types/auth/check-auth';
import { LoginUserD, LoginUserRD } from '@api-types/auth/login-user';

import { ajax } from '../ajax';
import { IServerError, Empty } from '../types';
import { Dispatch, store } from '../store';

const CHECK_AUTH_URL = '/api/auth/check';
const LOGIN_USER_URL = '/api/auth/login';

export const loginUser = async (props: LoginUserD) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'login-form/loading' });

    let response: LoginUserRD | undefined;

    try {
        response = await ajax.post<LoginUserD, LoginUserRD, Empty>({
            url: LOGIN_USER_URL,
            data: props,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        if (e?.name) {
            if (e.fieldError?.fieldName) {
                if (e.fieldError.fieldName === 'password') {
                    dispath({ type: 'login-form/error', data: { field: 'passwordError', error: e.fieldError.error } });
                    return;
                } else if (e.fieldError.fieldName === 'emailOrUsername') {
                    dispath({
                        type: 'login-form/error',
                        data: { field: 'loginOrEmailError', error: e.fieldError.error },
                    });
                    return;
                }
            }

            dispath({ type: 'logger/add-log', data: { type: 'error', title: e.name, description: e.description } });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'login-form/success' });
    dispath({
        type: 'user/success',
        data: {
            userId: response.id,
            username: response.username,
            email: response.email,
            isAdmin: response.is_admin,
        },
    });
};

export const checkAuth = async () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'user/loading' });

    let response: CheckAuthRD | undefined;

    try {
        response = await ajax.get<CheckAuthRD, Empty>({
            url: CHECK_AUTH_URL,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'user/none' });

        if (e?.name) {
            dispath({
                type: 'logger/add-log',
                data: { type: 'error', title: e.name, description: e.description },
            });
        }

        return;
    }

    dispath({
        type: 'user/success',
        data: response,
    });
};
