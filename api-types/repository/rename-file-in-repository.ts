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

export type RenameFileInRepositoryD = {
    name: string;
    pathToFile: string;
    repositoryId: number;
    newName: string;
};

export type RenameFileInRepositoryRD = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
} | {
    name: string;
    pathToDir: string[];
    status: DirStatus;
};
