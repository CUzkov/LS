export type GetUsersWithGroupAccessR = {
    access: string;
    id: number;
    username: string;
    is_admin: boolean;
    email: string;
};

export type GetUsersWithGroupAccessQP = [number];

export const getUsersWithGroupAccessQ = 'SELECT * from get_users_with_group_access($1)';
