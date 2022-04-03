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

export type DraftFilesByDirPathQP = {
    repositoryId: number;
    pathToDir: string;
    dirName: string;
}

export type DraftFilesByDirPathRD = {
    files: {
        name: string;
        pathToFile: string[];
        status: FileStatus;
    }[];
    deletedFiles: {
        name: string;
        pathToFile: string[];
        status: FileStatus;
    }[];
    dirs: {
        name: string;
        pathToDir: string[];
        status: DirStatus;
    }[];
};
