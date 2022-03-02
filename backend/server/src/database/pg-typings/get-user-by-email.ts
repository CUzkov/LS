export type GetUserByEmailR = {
    id: number;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
};

export type GetUserByEmailQP = [string];

export const getUserByEmailQ = 'SELECT * from get_user_by_email($1)';
