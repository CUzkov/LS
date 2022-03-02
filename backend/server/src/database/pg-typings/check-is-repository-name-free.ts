export type CheckIsRepositoryNameFreeR = {
    id: number;
};

export type CheckIsRepositoryNameFreeQP = [string, number];

export const checkIsRepositoryNameFreeQ = 'SELECT * from check_is_repository_name_free($1, $2)';
