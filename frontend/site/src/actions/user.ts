import { LoginUserData, LoginUserReturnData, CheckAuthReturnData } from '@api-types/auth';

import { ajax, ContentType, AjaxType } from '../ajax';
import type { IServerError, Empty } from '../types';
import type { Dispatch } from '../store';
import { NO_SUCH_USER, INCORRECT_PASSWORD } from 'store/reducers/login-form';
import { CHECK_AUTH_URL, LOGIN_USER_URL } from './urls';

export const loginUser = async (dispath: Dispatch, props: LoginUserData) => {
    dispath({ type: 'login-form/loading' });

    const response = await ajax<LoginUserReturnData | IServerError, LoginUserData>({
        type: AjaxType.post,
        contentType: ContentType.JSON,
        url: LOGIN_USER_URL,
        data: props,
    }).catch(() => {
        dispath({ type: 'login-form/failed' });
        return;
    });

    if (!response) {
        return;
    }

    if ('id' in response) {
        const user = {
            userId: response.id,
            username: response.username,
            email: response.email,
            isAdmin: response.is_admin,
        };

        dispath({ type: 'login-form/success' });

        dispath({ type: 'user/success', data: user });
    } else {
        if (response.error === NO_SUCH_USER || response.error === INCORRECT_PASSWORD) {
            dispath({ type: 'login-form/error', data: { error: response.error } });
            return;
        }

        dispath({ type: 'login-form/failed' });
    }
};

export const checkAuth = async (dispath: Dispatch) => {
    dispath({ type: 'user/loading' });

    const response = await ajax<CheckAuthReturnData | IServerError, Empty>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: CHECK_AUTH_URL,
    }).catch(() => {
        dispath({ type: 'user/none' });
        return {};
    });

    if ('error' in response) {
        dispath({ type: 'user/none' });
    } else {
        dispath({
            type: 'user/success',
            data: response,
        });
    }
};
