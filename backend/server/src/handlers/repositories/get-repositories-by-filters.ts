import { IsOptional, IsString, IsNumber, validate, IsBoolean, IsArray } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';

type GetRepositoriesByFilterQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
    excludeRepositoryIds?: number[];
    quantity: number;
};

type GetRepositoriesByFilterRD = {
    repositories: {
        repository: {
            title: string;
            id: number;
        };
        version: string;
    }[];
    count: number;
};

class GetRepositoriesByFilterQPValidator {
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
    excludeRepositoryIds: number[];

    @IsNumber()
    page: number;

    @IsNumber()
    quantity: number;

    constructor({ is_rw, is_rwa, title, by_user, excludeRepositoryIds, page, quantity }: GetRepositoriesByFilterQP) {
        this.is_rw = Boolean(is_rw);
        this.is_rwa = Boolean(is_rwa);
        this.title = title;
        this.by_user = by_user !== undefined ? Number(by_user) : undefined;
        this.excludeRepositoryIds = excludeRepositoryIds?.map((id) => Number(id)) ?? [];
        this.quantity = Number(quantity);
        this.page = Number(page);
    }
}

export const getRepositoriesByFilter: ResponseCallback<Empty, GetRepositoriesByFilterQP> = async ({
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

    const queryParamsSanitize = new GetRepositoriesByFilterQPValidator(queryParams);
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
        const repositories = await RepositoryFns.getRepositoriesByFilters(queryParamsSanitize, userId);
        getOkResponse<GetRepositoriesByFilterRD>(response, repositories);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
