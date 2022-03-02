export type GetUserByIdR = {
    id: number;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
};

export type GetUserByIdQP = [number];

export const getUserByIdQ = 'SELECT * from get_user_by_id($1)';
