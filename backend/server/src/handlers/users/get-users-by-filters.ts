import { IsOptional, IsString, IsNumber, validate, IsArray } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { User, UserFns } from '../../models';

type GetUsersByFiltersQP = {
    page: number;
    quantity: number;
    username?: string;
    excludeUserIds?: number[];
};

type GetUsersByFiltersRD = {
    users: User[];
    count: number;
};

class GetUsersByFiltersQPValidator {
    @IsNumber()
    page: number;

    @IsNumber()
    quantity: number;

    @IsOptional()
    @IsString()
    username: string;

    @IsArray()
    @IsNumber({}, { each: true })
    excludeUserIds: number[];

    constructor({ page, quantity, excludeUserIds, username }: GetUsersByFiltersQP) {
        this.page = Number(page);
        this.quantity = Number(quantity);
        this.excludeUserIds = excludeUserIds?.map((id) => Number(id)) ?? [];
        this.username = username ?? '';
    }
}

export const getUsersByFilters: ResponseCallback<Empty, GetUsersByFiltersQP> = async ({
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

    const queryParamsSanitize = new GetUsersByFiltersQPValidator(queryParams);
    const errors = await validate(queryParamsSanitize);

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
        const users = await UserFns.getUsersByFilters(
            queryParamsSanitize.username,
            queryParamsSanitize.page,
            queryParamsSanitize.quantity,
            queryParamsSanitize.excludeUserIds,
        );
        getOkResponse<GetUsersByFiltersRD>(response, users);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
