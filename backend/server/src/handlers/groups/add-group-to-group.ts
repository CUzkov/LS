import { validate, IsNumber } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { GroupFns } from '../../models/group';

type AddGroupToGroupD = {
    parentId: number;
    childId: number;
};

type AddGroupToGroupRD = Empty;

class AddGroupToGroupDValidator {
    @IsNumber()
    childId: number;

    @IsNumber()
    parentId: number;

    constructor({ childId, parentId }: AddGroupToGroupD) {
        this.childId = Number(childId);
        this.parentId = Number(parentId);
    }
}

export const addGroupToGroup: ResponseCallback<AddGroupToGroupD, Empty> = async ({ response, userId, data }) => {
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

    const dataSanitize = new AddGroupToGroupDValidator(data);
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
        await GroupFns.addGroupToGroup(userId, data.parentId, data.childId);
        getOkResponse<AddGroupToGroupRD>(response);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};