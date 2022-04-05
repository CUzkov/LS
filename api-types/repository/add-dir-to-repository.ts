enum DirStatus {
    addOrRename = 'addOrRename',
    modify = 'modify',
    delete = 'delete',
    none = 'none',
}

export type AddDirToRepositoryD = {
    repositoryId: number;
    pathToDir: string[];
    newDirName: string;
}

export type AddDirToRepositoryRD = {
    name: string;
    pathToDir: string[];
    status: DirStatus;
};
