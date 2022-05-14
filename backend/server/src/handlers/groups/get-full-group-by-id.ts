import { IsNumber, validate } from 'class-validator';

import { GroupFns, FullGroup } from '../../models/group';
import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';

type GetFullGroupByIdQP = {
    groupId: number;
};

type GetFullGroupByIdRD = FullGroup;

class GetFullGroupByIdQPValidator {
    @IsNumber()
    groupId: number;

    constructor({ groupId }: GetFullGroupByIdQP) {
        this.groupId = Number(groupId)
    }
}

export const getFullGroupById: ResponseCallback<Empty, GetFullGroupByIdQP> = async ({
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
            new ServerError({ name: errorNames.noData, code: Code.badRequest }),
        );
    }

    const queryParamsSanitize = new GetFullGroupByIdQPValidator(queryParams);
    const errors = await validate(queryParamsSanitize);

    if (errors.length) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'Лишние параметраы или указанные параметры неверного типа!',
            }),
        );
    }

    try {
        const fullGroup = await GroupFns.getFullGroupById(userId, queryParamsSanitize.groupId);
        getOkResponse<GetFullGroupByIdRD>(response, fullGroup);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
