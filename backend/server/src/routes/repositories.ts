import { Route, Method } from '../types';

import { getRepositoryById } from '../handlers/repositories/get-repository-by-id';
import { addFileToRepository } from '../handlers/repositories/add-file-to-repository';
import { createRepository } from '../handlers/repositories/create-repository';
import { checkIsRepositoryNameFree } from '../handlers/repositories/check-is-repository-name-free';
import { getRepositoriesByFilter } from '../handlers/repositories/get-repositories-by-filters';
import { downloadFileOrDir } from '../handlers/repositories/download-file-or-dir';
import { getFilesAndDirsByFullDirPath } from '../handlers/repositories/get-files-and-dirs-by-full-dir-path';
import { getDraftFilesAndDirsByFullDirPath } from '../handlers/repositories/get-draft-files-and-dirs-by-full-dir-path';
import { deleteFileOrDirFromRepository } from '../handlers/repositories/delete-file-or-dir-from-repository';
import { renameFileOrDirInRepository } from '../handlers/repositories/rename-file-or-dir-in-repository';
import { saveRepositoryVersion } from '../handlers/repositories/save-repository-version';
import { addDirToRepository } from '../handlers/repositories/add-dir-to-repository';
import { getAllRepositoryVersions } from '../handlers/repositories/get-all-repository-versions';
import { changeRepository } from '../handlers/repositories/change-repository';
import { getUsersWithRepositoryRWrwaAccess } from '../handlers/repositories/get-users-with-repository-rw-rwa-access';
import { changeRepositoryAccess } from '../handlers/repositories/change-repository-access';

const REPOSITORY_BY_ID_URL = '/api/repository/id';
const CREATE_REPOSITORY_URL = '/api/repository/create';
const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';
const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

const GET_FILES_AND_DIRS_BY_FULL_DIR_PATH_URL = '/api/repository/files';
const GET_DRAFT_FILES_AND_DIRS_BY_FULL_DIR_PATH = '/api/repository/draft/files';
const DOWNLOAD_FILE_OR_DIR_URL = '/api/repository/download'; // draft and no draft

const RENAME_FILE_OR_DIR_IN_REPOSITORY = '/api/repository/draft/rename';
const DELETE_FILE_OR_DIR_FROM_REPOSITORY = '/api/repository/draft/delete';
const ADD_FILE_TO_REPOSITORY = '/api/repository/draft/add/file';
const ADD_DIR_TO_REPOSITORY = '/api/repository/draft/add/dir';

const SAVE_REPOSITORY_VERSION = '/api/repository/version/save';
const GET_ALL_REPOSITORY_VERSIONS = '/api/repository/version/all';

const CHANGE_REPOSITORY = '/api/repository/change';
const GET_USERS_WITH_REPOSITORY_RW_RWA_ACCESS = '/api/repository/get-rw-rwa-users';
const CHANGE_REPOSITORY_ACCESS = '/api/repository/change/access';

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
    [GET_FILES_AND_DIRS_BY_FULL_DIR_PATH_URL]: {
        name: 'getFilesAndDirsByFullDirPath',
        callback: getFilesAndDirsByFullDirPath,
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
        name: 'renameFileOrDirInRepository',
        callback: renameFileOrDirInRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [GET_DRAFT_FILES_AND_DIRS_BY_FULL_DIR_PATH]: {
        name: 'getDraftFilesAndDirsByFullDirPath',
        callback: getDraftFilesAndDirsByFullDirPath,
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
    [CHANGE_REPOSITORY]: {
        name: 'changeRepository',
        callback: changeRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [GET_USERS_WITH_REPOSITORY_RW_RWA_ACCESS]: {
        name: 'getUsersWithRepositoryRWrwaAccess',
        callback: getUsersWithRepositoryRWrwaAccess,
        method: Method.get,
        isNeedAuth: true,
    },
    [CHANGE_REPOSITORY_ACCESS]: {
        name: 'changeRepositoryAccess',
        callback: changeRepositoryAccess,
        method: Method.post,
        isNeedAuth: true,
    },
};
