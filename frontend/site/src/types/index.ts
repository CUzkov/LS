export interface IServerError {
    error: string;
    description: string;
}

export type Empty = Record<string, never>;

export enum FetchStatus {
    successed,
    failed,
    loading,
    error,
    none,
}

export type Map = {
    title: string;
    userId: number;
    id: number;
};

export type Repository = {
    title: string;
    id: string;
};

export const enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
}
