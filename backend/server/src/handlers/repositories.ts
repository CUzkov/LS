import {
    RepositoriesByFilterQP,
    RepositoriesByFilterReturnD,
    CreateRepositoryD,
    CreateRepositoryRD,
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository';

import { ResponseCallback, Empty } from '../types';
import { getOkResponse, getInternalServerErrorResponse, getBadRequestResponse } from '../utils/server_utils';
import { RepositoryFns } from '../models';

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

    getOkResponse<RepositoriesByFilterReturnD>(response, repositories || []);
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

    const isFree = await RepositoryFns.checkIsRepositoryNameFree(data);

    getOkResponse<CheckIsRepositoryNameFreeRD>(response, isFree ?? { isFree: false });
};
