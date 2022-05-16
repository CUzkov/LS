import { IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { isCorrectName } from '../../utils/paths';

type ChangeRepositoryD = {
    newTitle: string;
    repositoryId: number;
};

class ChangeRepositoryNameDValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    newTitle: string;

    constructor({ repositoryId, newTitle }: ChangeRepositoryD) {
        this.repositoryId = Number(repositoryId);
        this.newTitle = newTitle;
    }
}

export const changeRepository: ResponseCallback<ChangeRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!data) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noQueryParams, code: Code.badRequest }),
        );
    }

    const dataSanitize = new ChangeRepositoryNameDValidator(data);
    const errors = await validate(dataSanitize);

    if (errors.length) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'Лишние поля или указанные полля неверного типа!',
            }),
        );
    }

    if (!isCorrectName(dataSanitize.newTitle)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'newTitle содержит недопустимые символы!',
            }),
        );
    }

    try {
        await RepositoryFns.changeRepository(userId, dataSanitize.repositoryId, dataSanitize.newTitle);
        getOkResponse<Empty>(response);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
