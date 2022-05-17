export type ChangeRepositoryR = {
    change_repository: boolean;
};

export type ChangeRepositoryQP = [number, string, boolean];

export const changeRepositoryQ = 'SELECT * from change_repository($1, $2, $3)';
