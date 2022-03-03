export const LOGIN_USER_URL = '/api/auth/login';

export type LoginUserD = {
    username: string;
    password: string;
    email: string;
}

export type LoginUserRD = {
    id: number;
    username: string;
    email: string;
    is_admin: boolean;
}
