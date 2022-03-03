export const GET_FILES_BY_DIR_PATH_URL = '/api/repository/files';

export type FilesByDirPathQP = {
    repositoryId: number;
    pathToDir: string;
}

export type FilesByDirPathRD = {
    name: string;
    isDir: boolean;
    hasSubFiles: boolean;
    pathToFile: string[];
}[];
