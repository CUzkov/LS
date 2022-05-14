import { IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';

type GetAllRepositoryVersionsQP = {
    repositoryId: number;
};

type GetAllRepositoryVersionsRD = string[];

class GetAllRepositoryVersionsQPValidator {
    @IsNumber()
    repositoryId: number;

    constructor({ repositoryId }: GetAllRepositoryVersionsQP) {
        this.repositoryId = Number(repositoryId);
    }
}

export const getAllRepositoryVersions: ResponseCallback<Empty, GetAllRepositoryVersionsQP> = async ({
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

    const queryParamsSanitize = new GetAllRepositoryVersionsQPValidator(queryParams);
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
        const versions = await RepositoryFns.getAllRepositoryVersions(queryParamsSanitize.repositoryId, userId);
        getOkResponse<GetAllRepositoryVersionsRD>(response, versions);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
