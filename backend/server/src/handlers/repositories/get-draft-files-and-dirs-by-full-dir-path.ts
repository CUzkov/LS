import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { FileStatus, DirStatus } from '../../utils/git';

type GetDraftFilesAndDirsByDirPathQP = {
    repositoryId: number;
    pathToDir?: string;
    dirName?: string;
}

type GetDraftFilesAndDirsByDirPathRD = {
    files: {
        name: string;
        pathToFile: string[];
        status: FileStatus;
    }[];
    deletedFiles: {
        name: string;
        pathToFile: string[];
        status: FileStatus;
    }[];
    dirs: {
        name: string;
        pathToDir: string[];
        status: DirStatus;
    }[];
};

class GetDraftFilesAndDirsByDirPathQPValidator {
    @IsNumber()
    repositoryId: number;

    @IsOptional()
    @IsString()
    dirName?: string;

    @IsOptional()
    @IsString()
    pathToDir?: string;

    constructor({ dirName, pathToDir, repositoryId }: GetDraftFilesAndDirsByDirPathQP) {
        this.dirName = dirName;
        this.pathToDir = pathToDir;
        this.repositoryId = Number(repositoryId);
    } 
}

export const getDraftFilesAndDirsByFullDirPath: ResponseCallback<Empty, GetDraftFilesAndDirsByDirPathQP> = async ({
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

    const queryParamsSanitize = new GetDraftFilesAndDirsByDirPathQPValidator(queryParams);
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
        const files = await RepositoryFns.getDraftFilesAndDirsByFullDirPath(
            queryParamsSanitize.repositoryId,
            userId,
            queryParamsSanitize?.pathToDir?.split('~') ?? [],
            queryParamsSanitize.dirName,
        );
        getOkResponse<GetDraftFilesAndDirsByDirPathRD>(response, files);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};