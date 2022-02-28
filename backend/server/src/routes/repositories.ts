import {
    getRepositoriesByFilter,
    createRepository,
    checkIsRepositoryNameFree,
    getRepositoryById,
    downloadFile,
} from '../handlers/repositories';
import { Route, Method } from '../types';
import {
    REPOSITORIES_BY_FILTERS_URL,
    CREATE_REPOSITORY_URL,
    CHECK_IS_REPOSIROTY_NAME_FREE_URL,
    REPOSITORY_BY_ID_URL,
    DOWNLOAD_FILE_URL,
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
};
