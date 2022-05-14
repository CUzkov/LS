import { IsString, IsNumber, validate, IsBoolean } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getServerErrorResponse, getDownloadResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';

type DownloadFileOrDirQP = {
    repositoryId: number;
    pathToFile: string;
    fileName: string;
    isDraft: boolean;
};

class DownloadFileOrDirQPValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    pathToFile: string;

    @IsString()
    fileName: string;

    @IsBoolean()
    isDraft: boolean;

    constructor({ fileName, isDraft, pathToFile, repositoryId }: DownloadFileOrDirQP) {
        this.repositoryId = Number(repositoryId);
        this.pathToFile = pathToFile;
        this.fileName = fileName;
        this.isDraft = Boolean(isDraft);
    }
}

export const downloadFileOrDir: ResponseCallback<Empty, DownloadFileOrDirQP> = async ({
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

    const queryParamsSanitize = new DownloadFileOrDirQPValidator(queryParams);
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
        const absFullPathToFile = await RepositoryFns.getAbsFullPathToFile(
            queryParamsSanitize.repositoryId,
            userId,
            queryParamsSanitize.pathToFile?.split('~') ?? '',
            queryParamsSanitize.fileName,
            queryParamsSanitize.isDraft,
        );

        getDownloadResponse(response, absFullPathToFile);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
