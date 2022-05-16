export type GetUsersByFiltersR = {
    id: number;
    username: string;
    is_admin: boolean;
    email: string;
    users_count: number;
};

export type GetUsersByFiltersQP = [string, number, number, number[]];

export const getUsersByFiltersQ = 'SELECT * from get_users_by_filters($1, $2, $3, $4)';
