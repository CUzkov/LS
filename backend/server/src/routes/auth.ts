import { Route, Method } from '../types';

import { checkAuth } from '../handlers/auth/check-is-auth-user';
import { loginUser } from '../handlers/auth/login-user';

const CHECK_AUTH_URL = '/api/auth/check';
const LOGIN_USER_URL = '/api/auth/login';

export const AUTH_ROUTES: Record<string, Route> = {
    [LOGIN_USER_URL]: {
        name: 'loginUser',
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
