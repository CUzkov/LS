import { IsString, IsNumber, validate, IsBoolean } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { GroupFns } from '../../models/group';
import { isCorrectName } from '../../utils/paths';

type ChangeGroupD = {
    newTitle: string;
    newPrivate: boolean;
    groupId: number;
};

class ChangeGroupDValidator {
    @IsNumber()
    groupId: number;

    @IsString()
    newTitle: string;

    @IsBoolean()
    newPrivate: boolean;

    constructor({ groupId, newTitle, newPrivate }: ChangeGroupD) {
        this.groupId = Number(groupId);
        this.newTitle = newTitle;
        this.newPrivate = newPrivate;
    }
}

export const changeGroup: ResponseCallback<ChangeGroupD, Empty> = async ({ response, userId, data }) => {
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

    const dataSanitize = new ChangeGroupDValidator(data);
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

    if (!isCorrectName(dataSanitize.newTitle)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'newTitle содержит недопустимые символы!',
            }),
        );
    }

    try {
        await GroupFns.changeGroup(userId, dataSanitize.groupId, dataSanitize.newTitle, dataSanitize.newPrivate);
        getOkResponse<Empty>(response);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
