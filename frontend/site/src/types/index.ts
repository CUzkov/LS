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
