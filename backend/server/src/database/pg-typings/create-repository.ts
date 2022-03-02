export type CreateRepositoryR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    rubric_id?: number;
    map_id?: number;
};

export type CreateRepositoryQP = [string, string, boolean, number];

export const createRepositoryQ = 'SELECT * from create_repository($1, $2, $3, $4)';
