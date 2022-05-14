import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { FileStatus, DirStatus } from '../../utils/git';

type DeleteFileFromRepositoryD = {
    name: string;
    repositoryId: number;
    pathToFile?: string;
};

type DeleteFileFromRepositoryRD =
    | {
          name: string;
          pathToFile: string[];
          status: FileStatus;
      }
    | {
          name: string;
          pathToDir: string[];
          status: DirStatus;
      };

class DeleteFileFromRepositoryDValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    name: string;

    @IsOptional()
    @IsString()
    pathToFile?: string;

    constructor({ repositoryId, name, pathToFile }: DeleteFileFromRepositoryD) {
        this.repositoryId = Number(repositoryId);
        this.name = name;
        this.pathToFile = pathToFile;
    }
}

export const deleteFileOrDirFromRepository: ResponseCallback<DeleteFileFromRepositoryD, Empty> = async ({
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

    const dataSanitize = new DeleteFileFromRepositoryDValidator(data);
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
        const addedFile = await RepositoryFns.deleteFileOrDirFromRepository(
            dataSanitize.repositoryId,
            userId,
            dataSanitize.pathToFile?.split('~') ?? [],
            dataSanitize.name,
        );
        getOkResponse<DeleteFileFromRepositoryRD>(response, addedFile);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
