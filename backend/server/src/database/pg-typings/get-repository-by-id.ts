export type GetRepositoryByIdR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    rubric_id?: number;
    map_id?: number;
};

export type GetRepositoryByIdQP = [number, number];

export const getRepositoryByIdQ = 'SELECT * from get_repository_by_id($1, $2)';
