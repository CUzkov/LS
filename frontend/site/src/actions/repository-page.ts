import { AxiosError } from 'axios';

import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';
import { AddFileToRepositoryRD } from '@api-types/repository/add-file-to-repository';
import {
    DeleteFileFromRepositoryD,
    DeleteFileFromRepositoryRD,
} from '@api-types/repository/delete-file-from-repository';

import { getDirKeyByPath } from 'pages/repository-page/repository-page.utils';

import { ajax2 } from '../ajax';
import { Empty, FileMeta, IServerError } from 'types';
import { Dispatch, store } from '../store';
import {
    REPOSITORY_BY_ID_URL,
    GET_FILES_BY_DIR_PATH_URL,
    ADD_FILE_TO_REPOSITORY,
    DELETE_FILE_FROM_REPOSITORY,
} from './urls';

export const getPageRepositoriesById = async (id: number) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    dispath({ type: 'repository-page/repository/loading' });

    let response: RepositoryByIdRD;

    try {
        response = await ajax2.get<RepositoryByIdRD, RepositoryByIdQP>({
            url: REPOSITORY_BY_ID_URL,
            queryParams: { id }
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

export const getFilesByDirPath = async (pathToDir: string[], dirName: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    dispath({ type: 'repository-page/files/loading' });

    let response: FilesByDirPathRD;

    try {
        response = await ajax2.get<FilesByDirPathRD, FilesByDirPathQP>({
            url: GET_FILES_BY_DIR_PATH_URL,
            queryParams: {
                pathToDir: pathToDir.join('~'),
                dirName,
                repositoryId: repository?.id ?? -1
            }
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        dispath({ type: 'repository-page/files/error' });

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

    dispath({ type: 'repository-page/files/success', data: response });
};

export const clearChanges = async (dispath: Dispatch) => {};

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

    dispath({ type: 'repository-page/file/add', data: {file: response, isBeDeleted} });
};

export const changeFilesDirPath = (newFullPathToDir: string[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/set-path', data: newFullPathToDir });
};

export const deleteFile = async (file: FileMeta) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    let response: DeleteFileFromRepositoryRD;

    try {
        response = await ajax2.post<DeleteFileFromRepositoryD, DeleteFileFromRepositoryRD, Empty>({
            url: DELETE_FILE_FROM_REPOSITORY,
            data: { name: file.name, pathToFile: file.pathToFile.join('~'), repositoryId: repository?.id ?? -1 },
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: { title: 'Ошибка удаления файла!', description: `Файл ${file.name} не удалён`, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'repository-page/file/delete', data: response });
};
