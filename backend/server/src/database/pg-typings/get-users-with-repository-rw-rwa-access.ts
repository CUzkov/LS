export type GetUsersWithRepositoryRWrwaAccessR = {
    access: string;
    id: number;
    username: string;
    is_admin: boolean;
    email: string;
};

export type GetUsersWithRepositoryRWrwaAccessQP = [number];

export const getUsersWithRepositoryRWrwaAccessQ = 'SELECT * from get_users_with_repository_rw_rwa_access($1)';
