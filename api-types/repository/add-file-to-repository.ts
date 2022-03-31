export const ADD_FILE_TO_REPOSITORY = '/api/repository/add-file';

enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists'
}

export type AddFileToRepositoryD = {};

export type AddFileToRepositoryRD = {
    name: string;
    pathToFile: string[];
    isDir: boolean;
    status: FileStatus;
};