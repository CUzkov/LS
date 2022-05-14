import { IsString, validate, IsBoolean, IsEnum } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { Group, GroupFns, GroupType } from '../../models/group';

type CreateGroupD = {
    title: string;
    groupType: GroupType;
    isPrivate: boolean;
};

type CreateGroupRD = Group;

class CreateGroupDValidator {
    @IsString()
    title: string;

    @IsBoolean()
    isPrivate: boolean;

    @IsEnum({ [GroupType.map]: GroupType.map, [GroupType.rubric]: GroupType.rubric })
    groupType: GroupType;

    constructor({ isPrivate, title, groupType }: CreateGroupD) {
        this.title = title;
        this.isPrivate = isPrivate;
        this.groupType = groupType;
    }
}

export const createGroup: ResponseCallback<CreateGroupD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!data) {
        return getServerErrorResponse(response, new ServerError({ name: errorNames.noData, code: Code.badRequest }));
    }

    const dataSanitize = new CreateGroupDValidator(data);
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
        const group = await GroupFns.createGroup(
            dataSanitize.title,
            userId,
            dataSanitize.groupType,
            dataSanitize.isPrivate,
        );
        getOkResponse<CreateGroupRD>(response, group);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
