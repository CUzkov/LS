import { File } from 'formidable';

import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';
import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';
import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import { FilesByDirPathQP, FilesByDirPathRD } from '@api-types/repository/get-files-by-dir-path';
import { DraftFilesByDirPathQP, DraftFilesByDirPathRD } from '@api-types/repository/get-draft-files-by-full-dir-path';
import { DownloadFileQP } from '@api-types/repository/download-file';
import { AddFileToRepositoryRD } from '@api-types/repository/add-file-to-repository';
import { RenameFileInRepositoryD, RenameFileInRepositoryRD } from '@api-types/repository/rename-file-in-repository';
import { AddDirToRepositoryD, AddDirToRepositoryRD } from '@api-types/repository/add-dir-to-repository';
import {
    GetAllRepositoryVersionsQP,
    GetAllRepositoryVersionsRD,
} from '@api-types/repository/get-all-repository-versions';
import { SaveRepositoryVersionD, SaveRepositoryVersionRD } from '@api-types/repository/save-repository-version';
import {
    DeleteFileFromRepositoryD,
    DeleteFileFromRepositoryRD,
} from '@api-types/repository/delete-file-from-repository';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ResponseCallback, Empty, ServerError } from '../types';
import {
    getOkResponse,
    getInternalServerErrorResponse,
    getBadRequestResponse,
    getServerErrorResponse,
    getDownloadResponse,
    normalizeErrorCode,
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getOkResponse<CreateRepositoryRD>(response, {
            repository,
            version: '',
        });
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        const [repository, git] = await RepositoryFns.getRepositoryById(queryParams.id, userId);
        getOkResponse<RepositoryByIdRD>(response, {
            repository,
            version: queryParams?.version || (await git.getCurrentVersion()),
        });
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
    }
};

export const downloadFileOrDir: ResponseCallback<Empty, DownloadFileQP> = async ({ response, userId, queryParams }) => {
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
            queryParams.isDraft,
        );

        getDownloadResponse(response, absFullPathToFile);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
            queryParams.version,
        );
        getOkResponse<FilesByDirPathRD>(response, files);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
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
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
    }
};

export const addDirToRepository: ResponseCallback<AddDirToRepositoryD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.repositoryId || !data.newDirName || !data.pathToDir) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'newDirName, pathToDir и repositoryId являются обязательными параметрами!',
        );
    }

    try {
        const addedDir = await RepositoryFns.addDirToRepository(
            data.repositoryId,
            userId,
            data.pathToDir,
            data.newDirName,
        );
        getOkResponse<AddDirToRepositoryRD>(response, addedDir);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
    }
};

export const saveRepositoryVersion: ResponseCallback<SaveRepositoryVersionD, SaveRepositoryVersionRD> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!data?.repositoryId || !data.version) {
        return getBadRequestResponse(
            response,
            'Ошибка параметров',
            'version и repositoryId являются обязательными параметрами!',
        );
    }

    try {
        const version = await RepositoryFns.saveRepositoryVersion(
            data.repositoryId,
            userId,
            data.versionSummary,
            data.version,
        );
        getOkResponse<SaveRepositoryVersionRD>(response, version);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
    }
};

export const getAllRepositoryVersions: ResponseCallback<Empty, GetAllRepositoryVersionsQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    if (!queryParams?.repositoryId) {
        return getBadRequestResponse(response, 'Ошибка параметров', 'repositoryId является обязательным параметром!');
    }

    try {
        const versions = await RepositoryFns.getAllRepositoryVersions(queryParams.repositoryId, userId);
        getOkResponse<GetAllRepositoryVersionsRD>(response, versions);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, normalizeErrorCode(e.code));
    }
};
