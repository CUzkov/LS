export type RepositoryByIdQP = {
    id: number;
    version?: string;
}

export type RepositoryByIdRD = {
    repository: {
        title: string;
        id: number;
    },
    version: string;
};
