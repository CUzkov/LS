import { IsOptional, IsString, IsNumber, validate } from 'class-validator';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { FileStatus, DirStatus } from '../../utils/git';

type RenameFileInRepositoryD = {
    name: string;
    pathToFile: string;
    repositoryId: number;
    newName: string;
};

type RenameFileInRepositoryRD =
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

class RenameFileInRepositoryDValidator {
    @IsNumber()
    repositoryId: number;

    @IsString()
    name: string;

    @IsString()
    newName: string;

    @IsOptional()
    @IsString()
    pathToFile?: string;

    constructor({ repositoryId, name, newName, pathToFile }: RenameFileInRepositoryD) {
        this.repositoryId = Number(repositoryId);
        this.name = name;
        this.newName = newName;
        this.pathToFile = pathToFile;
    }
}

export const renameFileOrDirInRepository: ResponseCallback<RenameFileInRepositoryD, Empty> = async ({
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

    const dataSanitize = new RenameFileInRepositoryDValidator(data);
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

    try {
        const addedFile = await RepositoryFns.renameFileOrDirInRepository(
            dataSanitize.repositoryId,
            userId,
            dataSanitize.pathToFile?.split('~') ?? [],
            dataSanitize.name,
            dataSanitize.newName,
        );
        getOkResponse<RenameFileInRepositoryRD>(response, addedFile);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
