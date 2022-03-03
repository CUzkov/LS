import { QueryResult } from 'pg';

import { UserFns } from './';
import { pg } from '../database';
import { Git, File } from '../git';
import { errors } from '../constants/errors';

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

export type Repository = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    rubric_id?: number;
    map_id?: number;
    rootFiles: File[];
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
            throw errors.dbError(e.message);
        }

        if (!result.rowCount) {
            throw errors.dbError('Ошибка создания репозитория!');
        }

        const repository = result.rows[0];

        return { ...repository, rootFiles: [] };
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
            throw errors.dbError(e.message);
        }

        if (result.rowCount) {
            return { isFree: false };
        }

        return { isFree: true };
    },
    getRepositoryByFilters: async (
        { by_user, title, is_rw, is_rwa }: RepositoryFilters,
        userId: number,
    ): Promise<Repository[]> => {
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
            throw errors.dbError(e.message);
        }

        return result.rows.map((row) => ({
            id: row.id,
            path_to_repository: row.path_to_repository,
            is_private: row.is_private,
            user_id: row.user_id,
            title: row.title,
            rubric_id: row.rubric_id,
            map_id: row.map_id,
            rootFiles: [],
        }));
    },
    getRepositoryById: async (id: number, userId: number): Promise<[Repository, Git]> => {
        const user = await UserFns.getUserById(userId);
        let result: QueryResult<GetRepositoryByIdR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetRepositoryByIdR, GetRepositoryByIdQP>(getRepositoryByIdQ, [userId, id]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw errors.dbError(e.message);
        }

        if (!result.rowCount) {
            throw errors.repositoryNotFoundOrPermissionDenied('');
        }

        const repository = result.rows[0];
        const git = new Git(
            {
                email: user.email,
                username: user.username,
            },
            repository.title,
        );

        const rootFiles = await git.getFolderFiles();

        return [{ ...repository, rootFiles: rootFiles }, git];
    },
    getFilePath: async (id: number, userId: number, pathToFile: string[]): Promise<string> => {
        const [, git] = await RepositoryFns.getRepositoryById(id, userId);
        return git.getFullPathToFile(pathToFile);
    },
    getFilesByDirPath: async (id: number, userId: number, pathToDir: string[]): Promise<File[]> => {
        const [, git] = await RepositoryFns.getRepositoryById(id, userId);
        const files = git.getFolderFiles(pathToDir);
        return files;
    }
};
