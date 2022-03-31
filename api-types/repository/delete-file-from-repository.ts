export const DELETE_FILE_FROM_REPOSITORY = '/api/repository/delete-file';

enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists'
}

export type DeleteFileFromRepositoryD = {
    name: string;
    pathToFile: string;
    repositoryId: number;
};

export type DeleteFileFromRepositoryRD = {
    name: string;
    pathToFile: string[];
    isDir: boolean;
    status: FileStatus;
};