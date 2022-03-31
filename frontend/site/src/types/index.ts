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

export enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
}

export type FileMeta = {
    name: string;
    pathToFile: string[];
    isDir: boolean;
    status: FileStatus;
};

export type Repository = {
    title: string;
    id: number;
};

export const enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
}
