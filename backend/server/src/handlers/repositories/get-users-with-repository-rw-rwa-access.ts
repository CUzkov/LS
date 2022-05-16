import { IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns, User } from '../../models';
import { RWA } from '../../utils/access';

type GetUsersWithRepositoryRWrwaAccessQP = {
    repositoryId: number;
};

type GetUsersWithRepositoryRWrwaAccessRD = Array<User & { access: RWA }>;

class GetUsersWithRepositoryRWrwaAccessValidator {
    @IsNumber()
    repositoryId: number;

    constructor({ repositoryId }: GetUsersWithRepositoryRWrwaAccessQP) {
        this.repositoryId = Number(repositoryId);
    }
}

export const getUsersWithRepositoryRWrwaAccess: ResponseCallback<Empty, GetUsersWithRepositoryRWrwaAccessQP> = async ({
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

    const queryParamsSanitize = new GetUsersWithRepositoryRWrwaAccessValidator(queryParams);
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
        const users = await RepositoryFns.getUsersWithRepositoryRWrwaAccess(userId, queryParamsSanitize.repositoryId);
        getOkResponse<GetUsersWithRepositoryRWrwaAccessRD>(response, users);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
