import { QueryResult } from 'pg';
import { File } from 'formidable';
import fse from 'fs-extra';

import { UserFns } from './';
import { pg } from '../database';
import { Code } from '../types';
import { Git, FileMeta, DirMeta, DirStatus } from '../utils/git';

import {
    getRepositoryByIdQ,
    GetRepositoryByIdQP,
    GetRepositoryByIdR,
} from '../database/pg-typings/get-repository-by-id';
import {
    getRepositoryByFiltersQ,
    GetRepositoryByFiltersQP,
    GetRepositoryByFiltersR,
} from '../database/pg-typings/get-repository-by-filters';
import {
    checkIsRepositoryNameFreeQ,
    CheckIsRepositoryNameFreeQP,
    CheckIsRepositoryNameFreeR,
} from '../database/pg-typings/check-is-repository-name-free';
import { createRepositoryQ, CreateRepositoryQP, CreateRepositoryR } from '../database/pg-typings/create-repository';
import {
    setRepositoryPathToDraftQ,
    SetRepositoryPathToDraftQP,
    SetRepositoryPathToDraftR,
} from '../database/pg-typings/set-repository-path-to-draft';
import { ServerError, errorNames } from '../utils/server-error';

export type Repository = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    path_to_draft_repository?: string;
};

type RepositoryFilters = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
};

type NewRepository = {
    title: string;
    isPrivate: boolean;
};

export const RepositoryFns = {
    createRepository: async (newRepository: NewRepository, userId: number): Promise<Repository> => {
        const user = await UserFns.getUserById(userId);

        const git = new Git(
            {
                email: user.email,
                username: user.username,
            },
            newRepository.title,
        );

        await git.init();

        let result: QueryResult<CreateRepositoryR>;

        try {
            const client = await pg.connect();
            result = await client.query<CreateRepositoryR, CreateRepositoryQP>(createRepositoryQ, [
                git.path,
                newRepository.title,
                newRepository.isPrivate,
                userId,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Репозиторий не создан!',
            });
        }

        const repository = result.rows[0];

        return repository;
    },
    checkIsRepositoryNameFree: async (title: string, userId: number): Promise<{ isFree: boolean }> => {
        let result: QueryResult<CheckIsRepositoryNameFreeR>;

        try {
            const client = await pg.connect();
            result = await client.query<CheckIsRepositoryNameFreeR, CheckIsRepositoryNameFreeQP>(
                checkIsRepositoryNameFreeQ,
                [title, userId],
            );
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (result.rowCount) {
            return { isFree: false };
        }

        return { isFree: true };
    },
    getRepositoryByFilters: async (
        { by_user, title, is_rw, is_rwa }: RepositoryFilters,
        userId: number,
    ): Promise<{ repository: Repository; version: string }[]> => {
        let result: QueryResult<GetRepositoryByFiltersR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetRepositoryByFiltersR, GetRepositoryByFiltersQP>(getRepositoryByFiltersQ, [
                userId,
                by_user ?? -1,
                title ? `${title}%` : '',
                is_rw ?? false,
                is_rwa ?? false,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        const user = await UserFns.getUserById(userId);

        const resultPromises = result.rows.map(async (row) => {
            const git = new Git(
                {
                    email: user.email,
                    username: user.username,
                },
                row.title,
            );

            return {
                repository: {
                    id: row.id,
                    path_to_repository: row.path_to_repository,
                    is_private: row.is_private,
                    user_id: row.user_id,
                    title: row.title,
                    rootFiles: [],
                },
                version: await git.getCurrentVersion(),
            };
        });

        return await Promise.all(resultPromises);
    },
    getRepositoryById: async (
        id: number,
        userId: number,
        isNeedDraft = false,
        version?: string,
    ): Promise<[Repository, Git, Git | undefined, Git | undefined]> => {
        const user = await UserFns.getUserById(userId);
        let result: QueryResult<GetRepositoryByIdR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetRepositoryByIdR, GetRepositoryByIdQP>(getRepositoryByIdQ, [userId, id]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        const repository = result.rows[0];
        const git = new Git(
            {
                email: user.email,
                username: user.username,
            },
            repository.title,
        );

        await git.init();

        const gitDraft = isNeedDraft
            ? new Git(
                  {
                      email: user.email,
                      username: user.username,
                  },
                  repository.title,
                  true,
              )
            : undefined;

        await gitDraft?.init();

        const gitVersion = version
            ? new Git(
                  {
                      email: user.email,
                      username: user.username,
                  },
                  repository.title,
                  false,
                  { git, version },
              )
            : undefined;

        await gitVersion?.init();

        return [repository, git, gitDraft, gitVersion];
    },
    getAbsFullPathToFile: async (
        id: number,
        userId: number,
        pathToFile: string[],
        fileName: string,
        isDraft = false,
    ): Promise<string> => {
        const [, git, gitDraft] = await RepositoryFns.getRepositoryById(id, userId, isDraft);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        return (isDraft ? gitDraft : git).getAbsPathToFile([...pathToFile, fileName]);
    },
    getFilesByFullDirPath: async (
        id: number,
        userId: number,
        pathToDir: string[] = [],
        dirName = '',
        version?: string,
    ): Promise<{ files: FileMeta[]; dirs: DirMeta[] }> => {
        const [, git, , gitByVersion] = await RepositoryFns.getRepositoryById(id, userId, false, version);

        if (version && !gitByVersion) {
            throw new ServerError({ name: errorNames.cannotCheckoutToVersion, code: Code.badRequest });
        }

        const filesAndDirs = (version ? gitByVersion ?? git : git).getDirFiles(pathToDir, dirName);
        return filesAndDirs;
    },
    addFileToRepository: async (id: number, userId: number, pathToFile: string[], file: File): Promise<FileMeta> => {
        const [, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        if (!file.originalFilename) {
            throw new ServerError({ name: errorNames.fileNameNotPresent, code: Code.badRequest });
        }

        const addedFile = await gitDraft.addFile(pathToFile, file.originalFilename, file.filepath);

        return addedFile;
    },
    deleteFileOrDirFromRepository: async (
        id: number,
        userId: number,
        pathToFileOrDir: string[] = [],
        fileOrDirName: string,
    ): Promise<FileMeta | DirMeta> => {
        const [, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        const deletedFileOfDir = await gitDraft.deleteFileOrDir(pathToFileOrDir, fileOrDirName);

        return deletedFileOfDir;
    },
    renameFileOrDirInRepository: async (
        id: number,
        userId: number,
        pathToFile: string[] = [],
        fileName: string,
        newFileName: string,
    ): Promise<DirMeta | FileMeta> => {
        const [, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        const renamedFileOrDir = await gitDraft.renameFileOrDir(pathToFile, fileName, newFileName);

        return renamedFileOrDir;
    },
    getDraftFilesByFullDirPath: async (
        id: number,
        userId: number,
        pathToDir: string[] = [],
        dirName = '',
    ): Promise<{ files: FileMeta[]; dirs: DirMeta[]; deletedFiles: FileMeta[] }> => {
        const [repository, git, gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        await git._capture();

        if (!repository?.path_to_draft_repository) {
            await fse.copy(git.path, gitDraft.path);

            let result: QueryResult<SetRepositoryPathToDraftR>;

            try {
                const client = await pg.connect();
                result = await client.query<SetRepositoryPathToDraftR, SetRepositoryPathToDraftQP>(
                    setRepositoryPathToDraftQ,
                    [repository.id, gitDraft.path],
                );
                client.release();
            } catch (error) {
                const e = error as Error;
                throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
            }

            if (result.rows?.[0]?.path_to_draft_repository !== gitDraft.path) {
                throw new ServerError({
                    name: errorNames.dbError,
                    code: Code.badRequest,
                    message: 'Путь до репозитория не проставлен в бд',
                });
            }
        }

        const filesAndDirs = gitDraft.getDraftDirFiles(pathToDir, dirName);

        git._release();

        return filesAndDirs;
    },
    addDirToRepository: async (
        id: number,
        userId: number,
        pathToDir: string[],
        newDirName: string,
    ): Promise<DirMeta> => {
        const [, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        gitDraft.addDir(pathToDir, newDirName);

        return {
            name: newDirName,
            pathToDir,
            status: DirStatus.none,
        };
    },
    saveRepositoryVersion: async (
        id: number,
        userId: number,
        versionSummary: string,
        version: [number, number, number],
    ) => {
        const [, git, gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        const formattedVersion = await gitDraft.saveVersion(git, versionSummary, version);

        return {
            version: formattedVersion,
        };
    },
    getAllRepositoryVersions: async (id: number, userId: number): Promise<string[]> => {
        const [, git] = await RepositoryFns.getRepositoryById(id, userId);

        return await git.getAllVersions();
    },
};
