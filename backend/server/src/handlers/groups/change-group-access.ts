import { IsNumber, validate, IsArray, IsEnum } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { GroupFns } from '../../models/group';
import { RWA } from '../../utils/access';

type ChangeGroupAccessD = {
    groupId: number;
    userIds: number[];
    access: RWA;
};

class ChangeGroupAccessDValidator {
    @IsNumber()
    groupId: number;

    @IsArray()
    @IsNumber({}, { each: true })
    userIds: number[];

    @IsEnum({ [RWA.none]: RWA.none, [RWA.r]: RWA.r, [RWA.rw]: RWA.rw, [RWA.rwa]: RWA.rwa })
    access: RWA;

    constructor({ groupId, access, userIds }: ChangeGroupAccessD) {
        this.groupId = Number(groupId);
        this.access = access;
        this.userIds = userIds;
    }
}

export const changeGroupAccess: ResponseCallback<ChangeGroupAccessD, Empty> = async ({ response, userId, data }) => {
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

    const dataSanitize = new ChangeGroupAccessDValidator(data);
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

    try {
        await GroupFns.changeGroupAccess(userId, dataSanitize.groupId, dataSanitize.userIds, dataSanitize.access);
        getOkResponse<Empty>(response);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
