export const CREATE_REPOSITORY_URL = '/api/repository/create';

export type CreateRepositoryD = {
    title: string;
    isPrivate: boolean;
}

export type CreateRepositoryRD = {
    title: string;
    rootFiles: {
        name: string;
        isDir: boolean;
        hasSubFiles: boolean;
        pathToFile: string;
    }[];
    id: number;
}
