export const CREATE_REPOSITORY_URL = '/api/repository/create';

export type CreateRepositoryD = {
    title: string;
    isPrivate: boolean;
}

export type CreateRepositoryRD = {
    title: string;
    id: number;
}
