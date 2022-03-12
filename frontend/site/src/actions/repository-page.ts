import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';

import { ajax, ContentType, AjaxType } from '../ajax';
import { Empty, IServerError } from '../types';
import { Dispatch } from '../store';
import { REPOSITORY_BY_ID_URL, GET_FILES_BY_DIR_PATH_URL } from './urls';

export const getPageRepositoriesById = async (dispath: Dispatch, queryParams: RepositoryByIdQP) => {
    dispath({ type: 'repository-page/repository/loading' });

    let response: RepositoryByIdRD | IServerError;

    try {
        response = await ajax<RepositoryByIdRD | IServerError, RepositoryByIdQP>({
            type: AjaxType.get,
            contentType: ContentType.JSON,
            url: REPOSITORY_BY_ID_URL,
            queryParams,
        });
    } catch (error) {
        dispath({ type: 'repository-page/repository/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        dispath({ type: 'repository-page/repository/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: response.error, description: response.description },
        });
        return;
    }

    dispath({
        type: 'repository-page/repository/success',
        data: {
            repository: {
                data: response,
            },
        },
    });
};

export const getFilesByDirPath = async (dispath: Dispatch, queryParams: FilesByDirPathQP) => {
    dispath({ type: 'repository-page/files/loading' });

    let response: FilesByDirPathRD | IServerError;

    try {
        response = await ajax<FilesByDirPathRD | IServerError, Empty>({
            type: AjaxType.get,
            contentType: ContentType.JSON,
            url: GET_FILES_BY_DIR_PATH_URL,
            queryParams,
        });
    } catch (error) {
        dispath({ type: 'repository-page/files/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'repository-page/files/success', data: { files: { data: response } } });
};

export const changeFilesDirPath = (dispath: Dispatch, path: string[]) => {
    dispath({ type: 'repository-page/files/path', data: path });
};

export const addFantomFile = (dispath: Dispatch, pathToFile: string[], file: File, key: string) => {
    dispath({
        type: 'repository-page/unsaved/add-file',
        data: {
            file,
            key,
            fileMeta: {
                hasSubFiles: false,
                name: file.name,
                isDir: false,
                fantom: {
                    action: 'add',
                },
                pathToFile,
            },
        },
    });
};

export const clearFantomFiles = (dispath: Dispatch) => {
    dispath({ type: 'repository-page/unsaved/clear' });
};
