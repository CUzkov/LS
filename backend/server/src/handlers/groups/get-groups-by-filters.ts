import { IsOptional, IsBoolean, IsString, IsNumber, IsArray, IsEnum, validate } from 'class-validator';

import { GroupType, Group, GroupFns } from '../../models/group';
import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';

type GetGroupsByFiltersQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    groupType?: GroupType;
    excludeGroupIds?: number[];
    page: number;
    quantity: number;
};

type GetGroupsByFiltersRD = {
    groups: Group[];
    count: number;
};

class GetGroupsByFiltersQPValidator {
    @IsOptional()
    @IsBoolean()
    is_rw?: boolean;

    @IsOptional()
    @IsBoolean()
    is_rwa?: boolean;

    @IsOptional()
    @IsString()
    title?: string;

    @IsOptional()
    @IsNumber()
    by_user?: number;

    @IsArray()
    @IsNumber({}, { each: true })
    excludeGroupIds?: number[];

    @IsNumber()
    page: number;

    @IsNumber()
    quantity: number;

    @IsEnum({ [GroupType.map]: GroupType.map, [GroupType.rubric]: GroupType.rubric })
    groupType?: GroupType;

    constructor({ is_rw, is_rwa, title, by_user, excludeGroupIds, page, quantity, groupType }: GetGroupsByFiltersQP) {
        this.is_rw = Boolean(is_rw);
        this.is_rwa = Boolean(is_rwa);
        this.title = title;
        this.by_user = by_user !== undefined ? Number(by_user) : undefined;
        this.excludeGroupIds = excludeGroupIds?.map((id) => Number(id)) ?? [];
        this.quantity = Number(quantity);
        this.page = Number(page);
        this.groupType = groupType;
    }
}

export const getGroupsByFilter: ResponseCallback<Empty, GetGroupsByFiltersQP> = async ({
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

    const queryParamsSanitize = new GetGroupsByFiltersQPValidator(queryParams);
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
        const groups = await GroupFns.getGroupsByFilters(queryParamsSanitize, userId);
        getOkResponse<GetGroupsByFiltersRD>(response, groups);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
