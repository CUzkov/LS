import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';
import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';
import { DownloadFileQP } from '@api-types/repository/download-file';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ResponseCallback, Empty, ServerError, Code } from '../types';
import {
    getOkResponse,
    getInternalServerErrorResponse,
    getBadRequestResponse,
    getServerErrorResponse,
    getFileResponse,
} from '../utils/server-utils';
import { RepositoryFns } from '../models';
import { formatTitleToPath, isCorrectPath } from '../utils/paths';

export const getRepositoriesByFilter: ResponseCallback<Empty, RepositoriesByFilterQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams) {
        queryParams = {};
    }

    try {
        const repositories = await RepositoryFns.getRepositoryByFilters(queryParams, userId);
        getOkResponse<RepositoriesByFilterRD>(response, repositories);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const createRepository: ResponseCallback<CreateRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (data?.isPrivate === undefined || !data?.title) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    try {
        const repository = await RepositoryFns.createRepository({...data, title: formatTitleToPath(data.title)}, userId);
        getOkResponse<CreateRepositoryRD>(response, repository);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const checkIsRepositoryNameFree: ResponseCallback<CheckIsRepositoryNameFreeD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.title) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    const title = formatTitleToPath(data.title);

    if (!isCorrectPath(title)) {
        return getBadRequestResponse(response, 'Ошибка данных', 'Недопустимые символы в названии репозитория!', true);
    }

    try {
        const isFree = await RepositoryFns.checkIsRepositoryNameFree(title, userId);
        getOkResponse<CheckIsRepositoryNameFreeRD>(response, isFree);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const getRepositoryById: ResponseCallback<Empty, RepositoryByIdQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.id) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'Id является обязательным параметром!');
    }

    try {
        const [repository] = await RepositoryFns.getRepositoryById(queryParams.id, userId);
        getOkResponse<RepositoryByIdRD>(response, repository);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const downloadFile: ResponseCallback<Empty, DownloadFileQP> = async ({ response, userId, queryParams }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId || !queryParams.pathToFile) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'repositoryId и pathToFile являются обязательными параметрами!');
    }

    try {
        const pathToFile = await RepositoryFns.getFilePath(queryParams.repositoryId, userId, queryParams.pathToFile.split('~'));
        getFileResponse(response, pathToFile);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const getFilesByDirPath: ResponseCallback<Empty, FilesByDirPathQP> = async ({ response, userId, queryParams }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId || queryParams.pathToDir === undefined || queryParams.pathToDir === null) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'id и pathToDir являются обязательными параметрами!');
    }

    try {
        const files = await RepositoryFns.getFilesByDirPath(queryParams.repositoryId, userId, queryParams.pathToDir.split('~'));
        getOkResponse<FilesByDirPathRD>(response, files);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};
