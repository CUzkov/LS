export type ChangeRepositoryAccessR = {
    change_repository_access: boolean;
};

export type ChangeRepositoryAccessQP = [number, number[], string];

export const changeRepositoryAccessQ = 'SELECT * from change_repository_access($1, $2, $3)';
