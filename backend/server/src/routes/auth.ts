import {loginUser, checkAuth} from '../handlers';
import {Route, Method} from '../types';

export const AUTH_ROUTES: Record<string, Route> = {
    '/api/auth/login': {
        name: 'login',
        callback: loginUser,
        method: Method.post,
        isNeedAuth: false,
    },
    '/api/auth/check': {
        name: 'checkAuth',
        callback: checkAuth,
        method: Method.get,
        isNeedAuth: true
    },
};
