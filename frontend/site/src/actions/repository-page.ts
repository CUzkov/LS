import { AxiosError } from 'axios';

import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';
import { AddFileToRepositoryRD } from '@api-types/repository/add-file-to-repository';
import { RenameFileInRepositoryD, RenameFileInRepositoryRD } from '@api-types/repository/rename-file-in-repository';
import {
    DeleteFileFromRepositoryD,
    DeleteFileFromRepositoryRD,
} from '@api-types/repository/delete-file-from-repository';

import { getDirKeyByPath } from 'pages/repository-page/repository-page.utils';

import { ajax2 } from '../ajax';
import { DirMeta, Empty, FileMeta, IServerError } from 'types';
import { Dispatch, store } from '../store';

const REPOSITORY_BY_ID_URL = '/api/repository/id';

const GET_FILES_BY_FULL_DIR_PATH_URL = '/api/repository/files';
const GET_DRAFT_FILES_BY_FULL_DIR_PATH = '/api/repository/draft/files';

const RENAME_FILE_OR_DIR_IN_REPOSITORY = '/api/repository/draft/rename';
const DELETE_FILE_OR_DIR_FROM_REPOSITORY = '/api/repository/draft/delete';
const ADD_FILE_TO_REPOSITORY = '/api/repository/draft/add/file';
const ADD_DIR_TO_REPOSITORY = '/api/repository/draft/add/dir';

export const getPageRepositoriesById = async (id: number) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/repository/loading' });

    let response: RepositoryByIdRD;

    try {
        response = await ajax2.get<RepositoryByIdRD, RepositoryByIdQP>({
            url: REPOSITORY_BY_ID_URL,
            queryParams: { id },
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        dispath({ type: 'repository-page/repository/error' });

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: { type: 'error', title: e.error, description: e.description },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({
        type: 'repository-page/repository/success',
        data: response,
    });
};

export const getFilesByPath = async (pathToDir: string[], dirName: string, isDraft: boolean) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    if (!repository?.id) {
        return;
    }

    dispath({ type: 'repository-page/files-and-dirs/loading' });

    let response: FilesByDirPathRD;

    try {
        response = await ajax2.get<FilesByDirPathRD, FilesByDirPathQP>({
            url: isDraft ? GET_DRAFT_FILES_BY_FULL_DIR_PATH : GET_FILES_BY_FULL_DIR_PATH_URL,
            queryParams: {
                pathToDir: pathToDir.join('~'),
                dirName,
                repositoryId: repository?.id ?? -1,
            },
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        dispath({ type: 'repository-page/files-and-dirs/error' });

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: { title: e.error, description: e.description, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'repository-page/files-and-dirs/success', data: response });
};

export const addFile = async (file: File, isBeDeleted?: boolean) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { currentPath, repository },
    } = store.getState();

    const fileForm = new FormData();

    fileForm.append('file', file);
    fileForm.append('repositoryId', String(repository?.id ?? -1));
    fileForm.append('pathToDir', getDirKeyByPath(currentPath));

    let response: AddFileToRepositoryRD;

    try {
        response = await ajax2.post<FormData, AddFileToRepositoryRD, Empty>({
            url: ADD_FILE_TO_REPOSITORY,
            data: fileForm,
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: { title: 'Ошибка загрузки файла!', description: `Файл ${file.name} не загружен`, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'repository-page/file/add', data: { file: response, isBeDeleted } });
};

export const changeFilesDirPath = (newFullPathToDir: string[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/set-path', data: newFullPathToDir });
};

export const deleteFileOrDir = async (fileOrDir: FileMeta | DirMeta) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    const isFile = 'pathToFile' in fileOrDir;

    let response: DeleteFileFromRepositoryRD;

    try {
        response = await ajax2.post<DeleteFileFromRepositoryD, DeleteFileFromRepositoryRD, Empty>({
            url: DELETE_FILE_OR_DIR_FROM_REPOSITORY,
            data: {
                name: fileOrDir.name,
                pathToFile: (isFile ? fileOrDir.pathToFile : fileOrDir.pathToDir).join('~'),
                repositoryId: repository?.id ?? -1,
            },
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: {
                    title: isFile ? 'Ошибка удаления файла!' : 'Ошибка удаления папки!',
                    description: isFile ? `Файл ${fileOrDir.name} не удалён` : `Папка ${fileOrDir.name} не удалёна`,
                    type: 'error',
                },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'repository-page/file/delete', data: response });
};

export const renameFileOrDir = async (fileOrDir: FileMeta | DirMeta, newName: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository, currentPath },
    } = store.getState();

    const isFile = 'pathToFile' in fileOrDir;

    let response: RenameFileInRepositoryRD;

    try {
        response = await ajax2.post<RenameFileInRepositoryD, RenameFileInRepositoryRD, Empty>({
            url: RENAME_FILE_OR_DIR_IN_REPOSITORY,
            data: {
                name: fileOrDir.name,
                pathToFile: currentPath.join('~'),
                repositoryId: repository?.id ?? -1,
                newName,
            },
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: {
                    title: `Ошибка переименования ${isFile ? 'файла' : 'папки'}!`,
                    description: isFile
                        ? `Файл ${fileOrDir.name} не переименован`
                        : `Папка ${fileOrDir.name} не переименована`,
                    type: 'error',
                },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('pathToFile' in fileOrDir && 'pathToFile' in response) {
        dispath({ type: 'repository-page/file/rename', data: { oldFile: fileOrDir, newFile: response } });
    } else if ('pathToDir' in fileOrDir && 'pathToDir' in response) {
        dispath({ type: 'repository-page/dir/rename', data: { oldDir: fileOrDir, newDir: response } });
    }
};
