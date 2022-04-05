enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists',
    rename = 'rename'
}

enum DirStatus {
    addOrRename = 'addOrRename',
    modify = 'modify',
    delete = 'delete',
    none = 'none',
}

export type DeleteFileFromRepositoryD = {
    name: string;
    pathToFile: string;
    repositoryId: number;
};

export type DeleteFileFromRepositoryRD = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
} | {
    name: string;
    pathToDir: string[];
    status: DirStatus;
};