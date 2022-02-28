import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';
import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import { DownloadFileQP } from '@api-types/repository/download-file';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ResponseCallback, Empty } from '../types';
import { getOkResponse, getInternalServerErrorResponse, getBadRequestResponse, getFileResponse } from '../utils/server-utils';
import { RepositoryFns } from '../models';
import { formatStrForPath, isCorrectPath } from '../utils/paths';

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

    const repositories = await RepositoryFns.getRepositoryByFilters(queryParams, userId);

    getOkResponse<RepositoriesByFilterRD>(response, repositories || []);
};

export const createRepository: ResponseCallback<CreateRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (data?.isPrivate === undefined || !data?.title) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    const repository = await RepositoryFns.createRepository(data, userId);

    if (!repository) {
        return getInternalServerErrorResponse(response, 'Ошибка создания', '');
    }

    getOkResponse<CreateRepositoryRD>(response, repository);
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

    const title = formatStrForPath(data.title);

    if (!isCorrectPath(title)) {
        return getBadRequestResponse(response, 'Ошибка данных', 'Недопустимые символы в названии репозитория!', true);
    }

    const isFree = await RepositoryFns.checkIsRepositoryNameFree({ title });

    getOkResponse<CheckIsRepositoryNameFreeRD>(response, isFree ?? { isFree: false });
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

    const repository = await RepositoryFns.getRepositoryById(queryParams.id, userId);

    if (!repository) {
        return getBadRequestResponse(response, 'Ошибка доступа', 'Нет прав на просмотр этого репозитория!');
    }

    getOkResponse<RepositoryByIdRD>(response, repository);
};

export const downloadFile: ResponseCallback<Empty, DownloadFileQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId || !queryParams.pathToFile) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'Id является обязательным параметром!');
    }

    const pathToFile = await RepositoryFns.getFilePath(queryParams.repositoryId, userId, queryParams.pathToFile);

    if (!pathToFile) {
        return getBadRequestResponse(response, 'Ошибка доступа', 'Нет прав на просмотр этого репозитория!');
    }

    getFileResponse(response, pathToFile);
};
