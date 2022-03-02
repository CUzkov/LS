export type GetUserByUsernameR = {
    id: number;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
};

export type GetUserByUsernameQP = [string];

export const getUserByUsernameQ = 'SELECT * from get_user_by_username($1)';
