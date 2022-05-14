import { IsString, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { formatTitleToPath, isCorrectPath } from '../../utils/paths';

type CheckIsRepositoryNameFreeD = {
    title: string;
}

type CheckIsRepositoryNameFreeRD = {
    isFree: boolean;
};

class CheckIsRepositoryNameFreeDValidator {
    @IsString()
    title: string;

    constructor({ title }: CheckIsRepositoryNameFreeD) {
        this.title = title;
    }
}

export const checkIsRepositoryNameFree: ResponseCallback<CheckIsRepositoryNameFreeD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!data) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noData, code: Code.badRequest }),
        );
    }

    const dataSanitize = new CheckIsRepositoryNameFreeDValidator(data);
    const errors = await validate(dataSanitize);

    if (errors.length) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'Лишние поля или указанные поля неверного типа!',
            }),
        );
    }
    const title = formatTitleToPath(data.title);

    if (!isCorrectPath(title)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.fieldValidationError,
                code: Code.badRequest,
                fieldError: { error: 'недопустимые символы в названии', fieldName: 'title' },
            }),
        );
    }

    try {
        const isFree = await RepositoryFns.checkIsRepositoryNameFree(title, userId);
        getOkResponse<CheckIsRepositoryNameFreeRD>(response, isFree);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
