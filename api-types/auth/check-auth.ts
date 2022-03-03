export const CHECK_AUTH_URL = '/api/auth/check';

export type CheckAuthRD = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
}
