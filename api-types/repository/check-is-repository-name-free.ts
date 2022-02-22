export const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';

export type CheckIsRepositoryNameFreeD = {
    title: string;
}

export type CheckIsRepositoryNameFreeRD = {
    isFree: boolean;
};
