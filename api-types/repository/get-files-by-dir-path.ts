export const GET_FILES_BY_DIR_PATH_URL = '/api/repository/files';

enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists'
}

export type FilesByDirPathQP = {
    repositoryId: number;
    pathToDir: string;
    dirName: string;
}

export type FilesByDirPathRD = {
    name: string;
    isDir: boolean;
    pathToFile: string[];
    status: FileStatus;
}[];
