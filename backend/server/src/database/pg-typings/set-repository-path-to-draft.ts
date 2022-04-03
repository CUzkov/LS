export type SetRepositoryPathToDraftR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    path_to_draft_repository?: string;
    rubric_id?: number;
    map_id?: number;
};

export type SetRepositoryPathToDraftQP = [number, string];

export const setRepositoryPathToDraftQ = 'SELECT * from set_repository_path_to_draft($1, $2)';
