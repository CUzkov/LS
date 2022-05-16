import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { Repository, RepositoryFns } from '../../models';

type GetRepositoryByIdQP = {
    id: number;
    version?: string;
};

type GetRepositoryByIdRD = {
    repository: Repository;
    version: string;
};

class GetRepositoryByIdQPValidator {
    @IsNumber()
    id: number;

    @IsOptional()
    @IsString()
    version?: string;

    constructor({ id, version }: GetRepositoryByIdQP) {
        this.id = Number(id);
        this.version = version;
    }
}

export const getRepositoryById: ResponseCallback<Empty, GetRepositoryByIdQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!queryParams) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noQueryParams, code: Code.badRequest }),
        );
    }

    const queryParamsSanitize = new GetRepositoryByIdQPValidator(queryParams);
    const errors = await validate(queryParamsSanitize);

    if (errors.length) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'Лишние параметры или указанные параметры неверного типа!',
            }),
        );
    }

    try {
        const [repository, git] = await RepositoryFns.getRepositoryById(queryParamsSanitize.id, userId);
        getOkResponse<GetRepositoryByIdRD>(response, {
            repository,
            version: queryParams?.version || (await git.getCurrentVersion()),
        });
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
