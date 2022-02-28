export const REPOSITORY_BY_ID_URL = '/api/repository/id';

export type RepositoryByIdQP = {
    id: number;
}

export type RepositoryByIdRD = {
    title: string;
    id: number;
    rootFiles: {
        name: string;
        isDir: boolean;
        hasSubFiles: boolean;
        pathToFile: string;
    }[];
};
