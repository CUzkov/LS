import {
    getRepositoriesByFilter,
    createRepository,
    checkIsRepositoryNameFree,
    getRepositoryById,
    downloadFileOrDir,
    getFilesByFullDirPath,
    addFileToRepository,
    deleteFileOrDirFromRepository,
    renameFileOrDirFromRepository,
    getDraftFilesByFullDirPath,
    addDirToRepository,
    saveRepositoryVersion,
    getAllRepositoryVersions,
} from '../handlers/repositories';
import { Route, Method } from '../types';

const REPOSITORY_BY_ID_URL = '/api/repository/id';
const CREATE_REPOSITORY_URL = '/api/repository/create';
const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';
const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

const GET_FILES_BY_FULL_DIR_PATH_URL = '/api/repository/files';
const GET_DRAFT_FILES_BY_FULL_DIR_PATH = '/api/repository/draft/files';
const DOWNLOAD_FILE_OR_DIR_URL = '/api/repository/download'; // draft and no draft

const RENAME_FILE_OR_DIR_IN_REPOSITORY = '/api/repository/draft/rename';
const DELETE_FILE_OR_DIR_FROM_REPOSITORY = '/api/repository/draft/delete';
const ADD_FILE_TO_REPOSITORY = '/api/repository/draft/add/file';
const ADD_DIR_TO_REPOSITORY = '/api/repository/draft/add/dir';

const SAVE_REPOSITORY_VERSION = '/api/repository/version/save';
const GET_ALL_REPOSITORY_VERSIONS = '/api/repository/version/all';

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
    [DOWNLOAD_FILE_OR_DIR_URL]: {
        name: 'downloadFileOrDir',
        callback: downloadFileOrDir,
        method: Method.get,
        isNeedAuth: true,
    },
    [GET_FILES_BY_FULL_DIR_PATH_URL]: {
        name: 'getFilesByFullDirPath',
        callback: getFilesByFullDirPath,
        method: Method.get,
        isNeedAuth: true,
    },
    [ADD_FILE_TO_REPOSITORY]: {
        name: 'addFileToRepository',
        callback: addFileToRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [DELETE_FILE_OR_DIR_FROM_REPOSITORY]: {
        name: 'deleteFileOrDirFromRepository',
        callback: deleteFileOrDirFromRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [RENAME_FILE_OR_DIR_IN_REPOSITORY]: {
        name: 'renameFileOrDirFromRepository',
        callback: renameFileOrDirFromRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [GET_DRAFT_FILES_BY_FULL_DIR_PATH]: {
        name: 'getDraftFilesByFullDirPath',
        callback: getDraftFilesByFullDirPath,
        method: Method.get,
        isNeedAuth: true,
    },
    [ADD_DIR_TO_REPOSITORY]: {
        name: 'addDirToRepository',
        callback: addDirToRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [SAVE_REPOSITORY_VERSION]: {
        name: 'saveRepositoryVersion',
        callback: saveRepositoryVersion,
        method: Method.post,
        isNeedAuth: true,
    },
    [GET_ALL_REPOSITORY_VERSIONS]: {
        name: 'getAllRepositoryVersions',
        callback: getAllRepositoryVersions,
        method: Method.get,
        isNeedAuth: true,
    },
};
