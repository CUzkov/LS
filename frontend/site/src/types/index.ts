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

export type File = {
    name: string;
    isDir: boolean;
    hasSubFiles: boolean;
    pathToFile: string;
};

export type Repository = {
    title: string;
    id: number;
    rootFiles: File[];
};

export const enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
}
