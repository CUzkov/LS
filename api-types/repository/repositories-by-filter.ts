export type RepositoriesByFilterQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
    quantity: number;
}

export type RepositoriesByFilterRD = {
    repositories: {
        repository: {
            title: string;
            id: number;
        },
        version: string;
    }[];
    count: number;
};
