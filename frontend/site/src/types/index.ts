export interface IServerError {
    error: string;
    description: string;
}

export type Empty = Record<string, never>;

export enum FetchStatus {
    successed,
    loading,
    error,
    none,
}

export type Map = {
    title: string;
    userId: number;
    id: number;
};

export type FileMeta = {
    name: string;
    isDir: boolean;
    hasSubFiles: boolean;
    pathToFile: string[];
    fantom?: {
        action: 'delete' | 'add' | 'rewrite' | 'rename';
    };
};

export type Repository = {
    title: string;
    id: number;
    rootFiles: FileMeta[];
};

export const enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
}
