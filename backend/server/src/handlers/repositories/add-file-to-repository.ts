import { File } from 'formidable';

import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { ServerError, errorNames } from '../../utils/server-error';
import { RepositoryFns } from '../../models';
import { FileStatus } from '../../utils/git';

type AddFileToRepositoryRD = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
};

export const addFileToRepository: ResponseCallback<Empty, Empty> = async ({ response, userId, formData }) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!formData?.fields?.repositoryId || !formData.files?.file) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.formDataError,
                code: Code.badRequest,
                message: 'file и repositoryId являются обязательными параметрами!',
            }),
        );
    }

    try {
        const addedFile = await RepositoryFns.addFileToRepository(
            Number(formData.fields.repositoryId),
            userId,
            ((formData.fields.pathToDir as string) ?? '').split('~'),
            formData.files.file as File,
        );
        getOkResponse<AddFileToRepositoryRD>(response, addedFile);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
