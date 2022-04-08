export type CreateRepositoryD = {
    title: string;
    isPrivate: boolean;
}

export type CreateRepositoryRD = {
    repository: {
        title: string;
        id: number;
    },
    version: string;
}
