import { IsString, validate, IsEnum } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { GroupFns, GroupType } from '../../models/group';
import { deleteExtraSpaces, isCorrectName } from '../../utils/paths';

type CheckIsGroupNameFreeD = {
    title: string;
    groupType: GroupType;
};

type CheckIsGroupNameFreeRD = {
    isFree: boolean;
};

class CheckIsGroupNameFreeDValidator {
    @IsString()
    title: string;

    @IsEnum({ [GroupType.map]: GroupType.map, [GroupType.rubric]: GroupType.rubric })
    groupType: GroupType;

    constructor({ groupType, title }: CheckIsGroupNameFreeD) {
        this.groupType = groupType;
        this.title = deleteExtraSpaces(title);
    }
}

export const checkIsGroupNameFree: ResponseCallback<CheckIsGroupNameFreeD, Empty> = async ({
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

    const dataSanitize = new CheckIsGroupNameFreeDValidator(data);
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

    if (!isCorrectName(dataSanitize.title)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.fieldValidationError,
                code: Code.badRequest,
                fieldError: { error: 'недопустимые символы в названии', fieldName: 'title' },
            }),
        );
    }

    try {
        const isFree = await GroupFns.checkIsGroupNameFree(dataSanitize.title, userId, dataSanitize.groupType);
        getOkResponse<CheckIsGroupNameFreeRD>(response, isFree);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
