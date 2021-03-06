import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { FileStatus, DirStatus } from '../../utils/git';

type GetFilesAndDirsByDirPathQP = {
    repositoryId: number;
    pathToDir?: string;
    dirName?: string;
    version?: string;
};

type GetFilesAndDirsByDirPathRD = {
    files: {
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

class GetFilesAndDirsByDirPathQPValidator {
    @IsNumber()
    repositoryId: number;

    @IsOptional()
    @IsString()
    dirName?: string;

    @IsOptional()
    @IsString()
    pathToDir?: string;

    @IsOptional()
    @IsString()
    version?: string;

    constructor({ dirName, pathToDir, repositoryId, version }: GetFilesAndDirsByDirPathQP) {
        this.dirName = dirName;
        this.pathToDir = pathToDir;
        this.version = version;
        this.repositoryId = Number(repositoryId);
    }
}

export const getFilesAndDirsByFullDirPath: ResponseCallback<Empty, GetFilesAndDirsByDirPathQP> = async ({
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

    const queryParamsSanitize = new GetFilesAndDirsByDirPathQPValidator(queryParams);
    const errors = await validate(queryParamsSanitize);

    if (errors.length) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: '???????????? ?????????????????? ?????? ?????????????????? ?????????????????? ?????????????????? ????????!',
            }),
        );
    }

    try {
        const files = await RepositoryFns.getFilesAndDirsByFullDirPath(
            queryParamsSanitize.repositoryId,
            userId,
            queryParamsSanitize?.pathToDir?.split('~') ?? [],
            queryParamsSanitize.dirName,
            queryParamsSanitize.version,
        );
        getOkResponse<GetFilesAndDirsByDirPathRD>(response, files);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
