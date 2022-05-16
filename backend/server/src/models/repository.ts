import { QueryResult } from 'pg';
import { File } from 'formidable';
import fse from 'fs-extra';

import { UserFns, User } from './user';
import { pg } from '../database';
import { Code } from '../types';
import { Git, FileMeta, DirMeta, DirStatus } from '../utils/git';
import { ServerError, errorNames } from '../utils/server-error';
import { RWA, bitMaskToRWA, RWAtoBitMask } from '../utils/access';

import {
    getRepositoryByIdQ,
    GetRepositoryByIdQP,
    GetRepositoryByIdR,
} from '../database/pg-typings/get-repository-by-id';
import {
    getRepositoriesByFiltersQ,
    GetRepositoriesByFiltersQP,
    GetRepositoriesByFiltersR,
} from '../database/pg-typings/get-repositories-by-filters';
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
import {
    changeRepositoryQ,
    ChangeRepositoryQP,
    ChangeRepositoryR,
} from '../database/pg-typings/change-repository-title';
import {
    getUsersWithRepositoryRWrwaAccessQ,
    GetUsersWithRepositoryRWrwaAccessQP,
    GetUsersWithRepositoryRWrwaAccessR,
} from '../database/pg-typings/get-users-with-repository-rw-rwa-access';
import {
    changeRepositoryAccessQ,
    ChangeRepositoryAccessQP,
    ChangeRepositoryAccessR,
} from '../database/pg-typings/change-repository-access';

export type Repository = {
    id: number;
    pathToRepository: string;
    isPrivate: boolean;
    userId: number;
    username: string;
    title: string;
    pathToDraftRepository: string | null;
    access: RWA;
};

type RepositoryFilters = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
    quantity: number;
    excludeRepositoryIds: number[];
};

type NewRepository = {
    title: string;
    isPrivate: boolean;
};

export const RepositoryFns = {
    //@FIXME добавить доп проверку для одинаковых заголовков (сейчас только на уровне БД) и санитайзинг символов (сейчас только на фронте через вызов checkIsRepositoryNameFree)
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

        return {
            access: RWA.rwa,
            id: repository.id,
            isPrivate: repository.is_private,
            pathToDraftRepository: '',
            pathToRepository: '',
            title: repository.title,
            userId: repository.user_id,
            username: user.username,
        };
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
    getRepositoriesByFilters: async (
        { by_user, title, is_rw, is_rwa, page, quantity, excludeRepositoryIds }: RepositoryFilters,
        userId: number,
    ): Promise<{ repositories: { repository: Repository; version: string }[]; count: number }> => {
        let result: QueryResult<GetRepositoriesByFiltersR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetRepositoriesByFiltersR, GetRepositoriesByFiltersQP>(
                getRepositoriesByFiltersQ,
                [
                    userId,
                    by_user ?? -1,
                    title ? `${title}%` : '',
                    is_rw ?? false,
                    is_rwa ?? false,
                    page,
                    quantity,
                    excludeRepositoryIds,
                ],
            );
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return {
            repositories: result.rows.map((row) => {
                return {
                    repository: {
                        id: row.id,
                        userId: row.user_id,
                        title: row.title,
                        access: bitMaskToRWA(row.access, row.is_private),
                        rootFiles: [],
                        pathToDraftRepository: '',
                        isPrivate: row.is_private,
                        pathToRepository: '',
                        username: row.username,
                    },
                    version: '',
                };
            }),
            count: Math.ceil(result.rows?.[0]?.repositories_count / quantity) ?? 0,
        };
    },
    getRepositoryById: async (
        id: number,
        userId: number,
        isNeedDraft = false,
        version?: string,
    ): Promise<[Repository, Git, Git | undefined, Git | undefined]> => {
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

        const repository: Repository = {
            access: bitMaskToRWA(result.rows[0].access, result.rows[0].is_private),
            userId: result.rows[0].user_id,
            id: result.rows[0].id,
            title: result.rows[0].title,
            isPrivate: result.rows[0].is_private,
            pathToDraftRepository: '',
            pathToRepository: '',
            username: result.rows[0].username,
        };
        const repositoryOwner = await UserFns.getUserById(result.rows[0].user_id);

        const git = new Git(
            {
                email: repositoryOwner.email,
                username: repositoryOwner.username,
            },
            repository.title,
        );

        await git.init();

        const gitDraft = isNeedDraft
            ? new Git(
                  {
                      email: repositoryOwner.email,
                      username: repositoryOwner.username,
                  },
                  repository.title,
                  true,
              )
            : undefined;

        await gitDraft?.init();

        const gitVersion = version
            ? new Git(
                  {
                      email: repositoryOwner.email,
                      username: repositoryOwner.username,
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
    getFilesAndDirsByFullDirPath: async (
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

        return (version ? gitByVersion ?? git : git).getDirFiles(pathToDir, dirName);
    },
    addFileToRepository: async (id: number, userId: number, pathToFile: string[], file: File): Promise<FileMeta> => {
        const [repository, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

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
        const [repository, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

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
        const [repository, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        const renamedFileOrDir = await gitDraft.renameFileOrDir(pathToFile, fileName, newFileName);

        return renamedFileOrDir;
    },
    getDraftFilesAndDirsByFullDirPath: async (
        id: number,
        userId: number,
        pathToDir: string[] = [],
        dirName = '',
    ): Promise<{ files: FileMeta[]; dirs: DirMeta[]; deletedFiles: FileMeta[] }> => {
        const [repository, git, gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        if (!gitDraft) {
            throw new ServerError({ name: errorNames.cannotCreateDraftRepositpory, code: Code.badRequest });
        }

        await git._capture();

        if (!repository?.pathToDraftRepository) {
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
        const [repository, , gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

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
        const [repository, git, gitDraft] = await RepositoryFns.getRepositoryById(id, userId, true);

        if (repository.access !== RWA.rwa && repository.access !== RWA.rw) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

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
    changeRepository: async (userId: number, repositoryId: number, newTitle?: string): Promise<void> => {
        const [repository] = await RepositoryFns.getRepositoryById(repositoryId, userId);

        if (repository.access !== RWA.rw && repository.access !== RWA.rwa) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        try {
            const client = await pg.connect();
            await client.query<ChangeRepositoryR, ChangeRepositoryQP>(changeRepositoryQ, [
                repositoryId,
                newTitle ?? repository.title,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }
    },
    getUsersWithRepositoryRWrwaAccess: async (
        userId: number,
        repositoryId: number,
    ): Promise<Array<User & { access: RWA }>> => {
        const [repository] = await RepositoryFns.getRepositoryById(repositoryId, userId);

        if (repository.access !== RWA.rw && repository.access !== RWA.rwa) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        let result: QueryResult<GetUsersWithRepositoryRWrwaAccessR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUsersWithRepositoryRWrwaAccessR, GetUsersWithRepositoryRWrwaAccessQP>(
                getUsersWithRepositoryRWrwaAccessQ,
                [repositoryId],
            );
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return result.rows.map((user) => ({
            email: user.email,
            id: user.id,
            isAdmin: user.is_admin,
            username: user.username,
            access: bitMaskToRWA(user.access, user.is_admin),
        }));
    },
    changeRepositoryAccess: async (
        userId: number,
        repositoryId: number,
        userIdsToChange: number[],
        access: RWA,
    ): Promise<void> => {
        const [repository] = await RepositoryFns.getRepositoryById(repositoryId, userId);

        if (repository.access !== RWA.rwa) {
            throw new ServerError({ name: errorNames.repositoryNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        try {
            const client = await pg.connect();
            await client.query<ChangeRepositoryAccessR, ChangeRepositoryAccessQP>(changeRepositoryAccessQ, [
                repositoryId,
                userIdsToChange,
                RWAtoBitMask(access),
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }
    },
};
