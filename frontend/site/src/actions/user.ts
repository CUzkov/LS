import { CheckAuthRD } from '@api-types/auth/check-auth';
import { LoginUserD, LoginUserRD } from '@api-types/auth/login-user';

import { ajax, ContentType, AjaxType } from '../ajax';
import type { IServerError, Empty } from '../types';
import type { Dispatch } from '../store';
import { NO_SUCH_USER, INCORRECT_PASSWORD } from 'store/reducers/login-form';
import { CHECK_AUTH_URL, LOGIN_USER_URL } from './urls';

export const loginUser = async (dispath: Dispatch, props: LoginUserD) => {
    dispath({ type: 'login-form/loading' });

    let response: LoginUserRD | IServerError;

    try {
        response = await ajax<LoginUserRD | IServerError, LoginUserD>({
            type: AjaxType.post,
            contentType: ContentType.JSON,
            url: LOGIN_USER_URL,
            data: props,
        });
    } catch (error) {
        dispath({ type: 'login-form/error', data: { error: '' } });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        if (response.error === NO_SUCH_USER || response.error === INCORRECT_PASSWORD) {
            dispath({ type: 'login-form/error', data: { error: response.error } });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Неизвестная ошибка :(', description: '' } });
        dispath({ type: 'login-form/error', data: { error: '' } });
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

export const checkAuth = async (dispath: Dispatch) => {
    dispath({ type: 'user/loading' });

    let response: CheckAuthRD | IServerError;

    try {
        response = await ajax<CheckAuthRD | IServerError, Empty>({
            type: AjaxType.get,
            contentType: ContentType.JSON,
            url: CHECK_AUTH_URL,
        });
    } catch (error) {
        dispath({ type: 'user/none' });
        return;
    }

    if ('error' in response) {
        dispath({ type: 'user/none' });
        return;
    }

    dispath({
        type: 'user/success',
        data: response,
    });
};
