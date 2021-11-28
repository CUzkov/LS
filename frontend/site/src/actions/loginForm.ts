import type { Dispatch } from '../store';

import { LoginFormErrors } from '../store/reducers/loginForm';

export const setLoginForm = async (dispath: Dispatch, error: LoginFormErrors) => {
    dispath({ type: 'login-form/error', data: { error } });
};
