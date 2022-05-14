import { RWA } from "../../utils/access";

export type GetRepositoriesByFiltersR = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    access: RWA;
    repositories_count: number;
};

export type GetRepositoriesByFiltersQP = [number, number, string, boolean, boolean, number, number, number[]];

export const getRepositoriesByFiltersQ = 'SELECT * from get_repositories_by_filter($1, $2, $3, $4, $5, $6, $7, $8)';
