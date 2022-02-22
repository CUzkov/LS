export const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

export type RepositoriesByFilterQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
}

export type RepositoriesByFilterReturnD = {
    title: string;
    id: number;
}[];
