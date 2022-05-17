import { IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { User } from '../../models';
import { RWA } from '../../utils/access';
import { GroupFns } from '../../models/group';

type GetUsersWithGroupAccessQP = {
    groupId: number;
};

type GetUsersWithGroupAccessRD = Array<User & { access: RWA }>;

class GetUsersWithGroupAccessValidator {
    @IsNumber()
    groupId: number;

    constructor({ groupId }: GetUsersWithGroupAccessQP) {
        this.groupId = Number(groupId);
    }
}

export const getUsersWithGroupAccess: ResponseCallback<Empty, GetUsersWithGroupAccessQP> = async ({
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

    const queryParamsSanitize = new GetUsersWithGroupAccessValidator(queryParams);
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
        const users = await GroupFns.getUsersWithGroupAccess(userId, queryParamsSanitize.groupId);
        getOkResponse<GetUsersWithGroupAccessRD>(response, users);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
