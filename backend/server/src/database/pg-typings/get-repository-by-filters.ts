export type GetRepositoryByFiltersR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    rubric_id?: number;
    map_id?: number;
};

export type GetRepositoryByFiltersQP = [number, number, string, boolean, boolean];

export const getRepositoryByFiltersQ = 'SELECT * from get_repositories_by_filter($1, $2, $3, $4, $5)';
