import { Dispatch, store } from '../store';

export const setLoginForm = async (error: string, field: 'loginOrEmailError' | 'passwordError') => {
    const dispatch: Dispatch = store.dispatch;

    if (error) {
        dispatch({ type: 'login-form/error', data: { error, field } });
    } else {
        dispatch({ type: 'login-form/none' });
    }
};
