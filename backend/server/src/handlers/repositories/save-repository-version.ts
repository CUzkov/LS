import { IsString, IsNumber, validate, IsArray } from 'class-validator';

import { ResponseCallback, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';

type SaveRepositoryVersionD = {
    repositoryId: number;
    versionSummary: string;
    version: [number, number, number];
};

type SaveRepositoryVersionRD = {
    version: string;
};

class SaveRepositoryVersionDValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    versionSummary: string;

    @IsArray()
    @IsNumber({}, { each: true })
    version: [number, number, number];

    constructor({ repositoryId, version, versionSummary }: SaveRepositoryVersionD) {
        this.repositoryId = Number(repositoryId);
        this.versionSummary = versionSummary;
        this.version = [version?.[0], version?.[1], version?.[2]];
    }
}

export const saveRepositoryVersion: ResponseCallback<SaveRepositoryVersionD, SaveRepositoryVersionRD> = async ({
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
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noQueryParams, code: Code.badRequest }),
        );
    }

    const dataSanitize = new SaveRepositoryVersionDValidator(data);
    const errors = await validate(dataSanitize);

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
        const version = await RepositoryFns.saveRepositoryVersion(
            dataSanitize.repositoryId,
            userId,
            dataSanitize.versionSummary,
            dataSanitize.version,
        );
        getOkResponse<SaveRepositoryVersionRD>(response, version);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
