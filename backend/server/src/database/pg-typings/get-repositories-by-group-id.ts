export type GetRepositoriesByGroupIdR = {
    id: number;
    title: string;
    user_id: number;
    access: string;
    is_private: boolean;
};

export type GetRepositoriesByGroupIdQP = [number, number];

export const getRepositoriesByGroupIdQ = 'SELECT * from get_repositories_by_group_id($1, $2)';
