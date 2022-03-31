import {
    getRepositoriesByFilter,
    createRepository,
    checkIsRepositoryNameFree,
    getRepositoryById,
    downloadFile,
    getFilesByDirPath,
    addFileToRepository,
    deleteFileFromRepository,
} from '../handlers/repositories';
import { Route, Method } from '../types';
import {
    REPOSITORIES_BY_FILTERS_URL,
    CREATE_REPOSITORY_URL,
    CHECK_IS_REPOSIROTY_NAME_FREE_URL,
    REPOSITORY_BY_ID_URL,
    DOWNLOAD_FILE_URL,
    GET_FILES_BY_DIR_PATH_URL,
    ADD_FILE_TO_REPOSITORY,
    DELETE_FILE_FROM_REPOSITORY,
} from './constants';

export const REPOSITORIES_ROUTES: Record<string, Route> = {
    [REPOSITORIES_BY_FILTERS_URL]: {
        name: 'repositoriesByFilter',
        callback: getRepositoriesByFilter,
        method: Method.get,
        isNeedAuth: true,
    },
    [CREATE_REPOSITORY_URL]: {
        name: 'createRepository',
        callback: createRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [CHECK_IS_REPOSIROTY_NAME_FREE_URL]: {
        name: 'checkIsRepositoryNameFree',
        callback: checkIsRepositoryNameFree,
        method: Method.post,
        isNeedAuth: true,
    },
    [REPOSITORY_BY_ID_URL]: {
        name: 'getRepositoryById',
        callback: getRepositoryById,
        method: Method.get,
        isNeedAuth: true,
    },
    [DOWNLOAD_FILE_URL]: {
        name: 'downloadFile',
        callback: downloadFile,
        method: Method.get,
        isNeedAuth: true,
    },
    [GET_FILES_BY_DIR_PATH_URL]: {
        name: 'getFilesByDirPath',
        callback: getFilesByDirPath,
        method: Method.get,
        isNeedAuth: true,
    },
    [ADD_FILE_TO_REPOSITORY]: {
        name: 'addFileToRepository',
        callback: addFileToRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [DELETE_FILE_FROM_REPOSITORY]: {
        name: 'deleteFileFromRepository',
        callback: deleteFileFromRepository,
        method: Method.post,
        isNeedAuth: true,
    },
};
