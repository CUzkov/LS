import type { Dispatch } from '../store';

import { LoginFormErrors } from '../store/reducers/login-form';

export const setLoginForm = async (dispath: Dispatch, error: LoginFormErrors) => {
    dispath({ type: 'login-form/error', data: { error } });
};
