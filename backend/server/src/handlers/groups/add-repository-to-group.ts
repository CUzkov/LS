import { validate, IsNumber } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { GroupFns } from '../../models/group';

type AddRepositoryToGroupD = {
    repositoryId: number;
    groupId: number;
};

type AddRepositoryToGroupRD = Empty;

class AddRepositoryToGroupDValidator {
    @IsNumber()
    repositoryId: number;

    @IsNumber()
    groupId: number;

    constructor({ groupId, repositoryId }: AddRepositoryToGroupD) {
        this.repositoryId = Number(repositoryId);
        this.groupId = Number(groupId);
    }
}

export const addRepositoryToGroup: ResponseCallback<AddRepositoryToGroupD, Empty> = async ({
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
        return getServerErrorResponse(response, new ServerError({ name: errorNames.noData, code: Code.badRequest }));
    }

    const dataSanitize = new AddRepositoryToGroupDValidator(data);
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
        await GroupFns.addRepositoryToGroup(userId, dataSanitize.repositoryId, dataSanitize.groupId);
        getOkResponse<AddRepositoryToGroupRD>(response);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
