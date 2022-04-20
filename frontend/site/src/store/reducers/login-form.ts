import { FetchStatus } from '../../types';

export type LoginFormEvents =
    | { type: 'login-form/success' }
    | { type: 'login-form/loading' }
    | { type: 'login-form/none' }
    | { type: 'login-form/error'; data: { field: 'passwordError' | 'loginOrEmailError'; error: string } };

export type LoginFormStore = {
    passwordError: string;
    loginOrEmailError: string;
    fetchStatus: FetchStatus;
};

const initialState: LoginFormStore = {
    loginOrEmailError: '',
    passwordError: '',
    fetchStatus: FetchStatus.none,
};

export const loginFormReducer = (state: LoginFormStore = initialState, event: LoginFormEvents): LoginFormStore => {
    const result = { ...state };

    if (event.type === 'login-form/loading') {
        result.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'login-form/none') {
        result.fetchStatus = FetchStatus.none;
        result.loginOrEmailError = '';
        result.passwordError = '';
    }

    if (event.type === 'login-form/success') {
        result.fetchStatus = FetchStatus.successed;
    }

    if (event.type === 'login-form/error') {
        result[event.data.field] = event.data.error;
        result.fetchStatus = FetchStatus.error;
    }

    return result;
};
