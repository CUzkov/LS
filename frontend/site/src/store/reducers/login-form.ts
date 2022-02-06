import { FetchStatus } from '../../types';

export const INCORRECT_PASSWORD = 'Неверный пароль';
export const NO_SUCH_USER = 'Такого пользователя не существует';

export type LoginFormErrors = typeof INCORRECT_PASSWORD | typeof NO_SUCH_USER | '';

export interface ILoginFormD {
    error?: LoginFormErrors;
}

export type LoginFormEvents =
    | { type: 'login-form/failed' }
    | { type: 'login-form/success' }
    | { type: 'login-form/loading' }
    | { type: 'login-form/error'; data: ILoginFormD };

export type LoginFormStore = {
    error: LoginFormErrors;
    fetchStatus: FetchStatus;
};

const initialState: LoginFormStore = {
    error: '',
    fetchStatus: FetchStatus.none,
};

export const loginFormReducer = (state: LoginFormStore = initialState, event: LoginFormEvents): LoginFormStore => {
    if (event.type === 'login-form/failed') {
        return {
            ...state,
            fetchStatus: FetchStatus.failed,
        };
    }

    if (event.type === 'login-form/loading') {
        return {
            ...state,
            fetchStatus: FetchStatus.loading,
        };
    }

    if (event.type === 'login-form/error') {
        return {
            error: event.data.error ?? '',
            fetchStatus: FetchStatus.error,
        };
    }

    if (event.type === 'login-form/success') {
        return {
            ...state,
            fetchStatus: FetchStatus.successed,
        };
    }

    return state;
};
