import { File } from 'formidable';

import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';
import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';
import { DraftFilesByDirPathQP, DraftFilesByDirPathRD } from '@api-types/repository/get-draft-files-by-full-dir-path';
import { DownloadFileQP } from '@api-types/repository/download-file';
import { AddFileToRepositoryRD } from '@api-types/repository/add-file-to-repository';
import { RenameFileInRepositoryD, RenameFileInRepositoryRD } from '@api-types/repository/rename-file-in-repository';
import {
    DeleteFileFromRepositoryD,
    DeleteFileFromRepositoryRD,
} from '@api-types/repository/delete-file-from-repository';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ResponseCallback, Empty, ServerError, Code } from '../types';
import {
    getOkResponse,
    getInternalServerErrorResponse,
    getBadRequestResponse,
    getServerErrorResponse,
    getFileResponse,
} from '../utils/server-utils';
import { RepositoryFns } from '../models';
import { formatTitleToPath, isCorrectPath } from '../utils/paths';

export const getRepositoriesByFilter: ResponseCallback<Empty, RepositoriesByFilterQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams) {
        queryParams = {};
    }

    try {
        const repositories = await RepositoryFns.getRepositoryByFilters(queryParams, userId);
        getOkResponse<RepositoriesByFilterRD>(response, repositories);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const createRepository: ResponseCallback<CreateRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (data?.isPrivate === undefined || !data?.title) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    try {
        const repository = await RepositoryFns.createRepository(
            { ...data, title: formatTitleToPath(data.title) },
            userId,
        );
        getOkResponse<CreateRepositoryRD>(response, repository);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const checkIsRepositoryNameFree: ResponseCallback<CheckIsRepositoryNameFreeD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.title) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    const title = formatTitleToPath(data.title);

    if (!isCorrectPath(title)) {
        return getBadRequestResponse(response, 'Ошибка данных', 'Недопустимые символы в названии репозитория!', true);
    }

    try {
        const isFree = await RepositoryFns.checkIsRepositoryNameFree(title, userId);
        getOkResponse<CheckIsRepositoryNameFreeRD>(response, isFree);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const getRepositoryById: ResponseCallback<Empty, RepositoryByIdQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.id) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'Id является обязательным параметром!');
    }

    try {
        const [repository] = await RepositoryFns.getRepositoryById(queryParams.id, userId);
        getOkResponse<RepositoryByIdRD>(response, repository);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const downloadFile: ResponseCallback<Empty, DownloadFileQP> = async ({ response, userId, queryParams }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId || !queryParams.fileName) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'repositoryId и pathToFile являются обязательными параметрами!',
        );
    }

    try {
        const absFullPathToFile = await RepositoryFns.getAbsFullPathToFile(
            queryParams.repositoryId,
            userId,
            queryParams.pathToFile?.split('~') ?? '',
            queryParams.fileName,
            queryParams.isDraft
        );

        getFileResponse(response, absFullPathToFile);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const getFilesByFullDirPath: ResponseCallback<Empty, FilesByDirPathQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'id является обязательным параметром!');
    }

    try {
        const files = await RepositoryFns.getFilesByFullDirPath(
            queryParams.repositoryId,
            userId,
            queryParams.pathToDir.split('~'),
            queryParams.dirName,
        );
        getOkResponse<FilesByDirPathRD>(response, files);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const getDraftFilesByFullDirPath: ResponseCallback<Empty, DraftFilesByDirPathQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'id является обязательным параметром!');
    }

    try {
        const files = await RepositoryFns.getDraftFilesByFullDirPath(
            queryParams.repositoryId,
            userId,
            queryParams.pathToDir.split('~'),
            queryParams.dirName,
        );
        getOkResponse<DraftFilesByDirPathRD>(response, files);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const addFileToRepository: ResponseCallback<Empty, Empty> = async ({ response, userId, formData }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!formData?.fields?.repositoryId || !formData.files?.file) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'file и repositoryId являются обязательными параметрами!',
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
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const deleteFileOrDirFromRepository: ResponseCallback<DeleteFileFromRepositoryD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.repositoryId || !data?.name) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'repositoryId и name являются обязательными параметрами!',
        );
    }

    try {
        const addedFile = await RepositoryFns.deleteFileOrDirFromRepository(
            data.repositoryId,
            userId,
            data.pathToFile?.split('~') ?? [],
            data.name,
        );
        getOkResponse<DeleteFileFromRepositoryRD>(response, addedFile);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};

export const renameFileOrDirFromRepository: ResponseCallback<RenameFileInRepositoryD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.repositoryId || !data?.name || !data?.newName) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'repositoryId, name и newName являются обязательными параметрами!',
        );
    }

    try {
        const addedFile = await RepositoryFns.renameFileOrDirInRepository(
            data.repositoryId,
            userId,
            data.pathToFile?.split('~') ?? [],
            data.name,
            data.newName,
        );
        getOkResponse<RenameFileInRepositoryRD>(response, addedFile);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};
