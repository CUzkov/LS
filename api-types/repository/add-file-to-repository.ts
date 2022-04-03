enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists',
    rename = 'rename'
}

export type AddFileToRepositoryD = {};

export type AddFileToRepositoryRD = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
};