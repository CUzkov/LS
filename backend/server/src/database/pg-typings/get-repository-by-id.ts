export type GetRepositoryByIdR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    path_to_draft_repository: string | null;
    access: string | null;
    username: string;
};

export type GetRepositoryByIdQP = [number, number];

export const getRepositoryByIdQ = 'SELECT * from get_repository_by_id($1, $2)';
