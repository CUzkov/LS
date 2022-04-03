export type RepositoriesByFilterQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
}

export type RepositoriesByFilterRD = {
    title: string;
    id: number;
}[];
