import { loginUser, checkAuth } from '../handlers/auth';
import { Route, Method } from '../types';

const CHECK_AUTH_URL = '/api/auth/check';
const LOGIN_USER_URL = '/api/auth/login';

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
