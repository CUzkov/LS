import { IsString, validate, IsBoolean } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { formatTitleToPath } from '../../utils/paths';
import { RWA } from '../../utils/access';

type CreateRepositoryD = {
    title: string;
    isPrivate: boolean;
};

type CreateRepositoryRD = {
    repository: {
        title: string;
        id: number;
        access: RWA;
    };
    version: string;
};

class CreateRepositoryDValidator {
    @IsString()
    title: string;

    @IsBoolean()
    isPrivate: boolean;

    constructor({ isPrivate, title }: CreateRepositoryD) {
        this.title = title;
        this.isPrivate = isPrivate;
    }
}

export const createRepository: ResponseCallback<CreateRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!data) {
        return getServerErrorResponse(response, new ServerError({ name: errorNames.noData, code: Code.badRequest }));
    }

    const dataSanitize = new CreateRepositoryDValidator(data);
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

    try {
        const repository = await RepositoryFns.createRepository(
            { ...dataSanitize, title: formatTitleToPath(dataSanitize.title) },
            userId,
        );
        getOkResponse<CreateRepositoryRD>(response, {
            repository,
            version: '',
        });
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
