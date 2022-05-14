import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { DirStatus } from '../../utils/git';

type AddDirToRepositoryD = {
    repositoryId: number;
    newDirName: string;
    pathToDir?: string;
};

type AddDirToRepositoryRD = {
    name: string;
    pathToDir: string[];
    status: DirStatus;
};

class AddDirToRepositoryDValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    newDirName: string;

    @IsOptional()
    @IsString()
    pathToDir?: string;

    constructor({ newDirName, pathToDir, repositoryId }: AddDirToRepositoryD) {
        this.newDirName = newDirName;
        this.pathToDir = pathToDir;
        this.repositoryId = Number(repositoryId);
    }
}

export const addDirToRepository: ResponseCallback<AddDirToRepositoryD, Empty> = async ({ response, userId, data }) => {
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

    const dataSanitize = new AddDirToRepositoryDValidator(data);
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
        const addedDir = await RepositoryFns.addDirToRepository(
            dataSanitize.repositoryId,
            userId,
            dataSanitize?.pathToDir?.split('~') ?? [],
            dataSanitize.newDirName,
        );
        getOkResponse<AddDirToRepositoryRD>(response, addedDir);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
