export type ChangeRepositoryR = {
    change_repository_name: boolean;
};

export type ChangeRepositoryQP = [number, string];

export const changeRepositoryQ = 'SELECT * from change_repository($1, $2)';
