import { loginUser, checkAuth } from '../handlers';
import { Route, Method } from '../types';
import { CHECK_AUTH_URL, LOGIN_USER_URL } from './constants';

export const AUTH_ROUTES: Record<string, Route> = {
    [LOGIN_USER_URL]: {
        name: 'login',
        callback: loginUser,
        method: Method.post,
        isNeedAuth: false,
    },
    [CHECK_AUTH_URL]: {
        name: 'checkAuth',
        callback: checkAuth,
        method: Method.get,
        isNeedAuth: true,
    },
};
