export const CHECK_AUTH_URL = '/api/auth/check';

export type CheckAuthReturnD = {
    id: string;
    username: string;
    email: string;
    is_admin: boolean;
}
