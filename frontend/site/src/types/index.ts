export interface IServerError {
    name: string;
    description: string;
    fieldError?: {
        fieldName: string;
        error: string;
    };
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
    noExists = 'noExists',
    rename = 'rename',
}

export type FileMeta = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
};

export enum DirStatus {
    addOrRename = 'addOrRename',
    modify = 'modify',
    delete = 'delete',
    none = 'none',
}

export type DirMeta = {
    status: DirStatus;
    pathToDir: string[];
    name: string;
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

export enum GroupType {
    map = 'map',
    rubric = 'rubric',
}

export type Group = {
    id: number;
    title: string;
    type: GroupType;
};

export type FullGroup = {
    id: number;
    title: string;
    type: GroupType;
    parentId: number;
    children?: FullGroup[];
};
