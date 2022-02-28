import { UserFns } from './';
import { pg } from '../database';
import { Git, File } from '../git';

export type Repository = {
    id: number;
    path_to_repository: string;
    is_private: boolean;
    user_id: number;
    title: string;
    rubric_id?: number;
    map_id?: number;
    rootFiles: {
        name: string;
        isDir: boolean;
        hasSubFiles: boolean;
        pathToFile: string;
    }[];
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
    createRepository: async (newRepository: NewRepository, userId: number): Promise<Repository | void> => {
        const user = await UserFns.getUserById(userId);

        if (!user) {
            return;
        }

        const git = new Git(
            {
                email: user.email,
                username: user.username,
            },
            newRepository.title,
        );

        const client = await pg.connect();

        const result = await client.query('SELECT * from create_repository($1, $2, $3, $4)', [
            git.path,
            newRepository.title,
            newRepository.isPrivate,
            userId,
        ]);

        client.release();

        if (result.rows.length) {
            return {
                id: result.rows[0].id,
                path_to_repository: result.rows[0].path_to_repository,
                is_private: result.rows[0].is_private,
                user_id: result.rows[0].user_id,
                title: result.rows[0].title,
                rubric_id: result.rows[0].rubric_id,
                map_id: result.rows[0].map_id,
                rootFiles: [],
            };
        }
    },
    checkIsRepositoryNameFree: async ({ title }: { title: string }): Promise<{ isFree: boolean } | void> => {
        const client = await pg.connect();

        const result = await client.query('SELECT * from check_is_repository_name_free($1)', [title]);

        client.release();

        if (result.rows.length) {
            return { isFree: false };
        }

        return { isFree: true };
    },
    getRepositoryByFilters: async (
        { by_user, title, is_rw, is_rwa }: RepositoryFilters,
        userId: number,
    ): Promise<Repository[] | void> => {
        const client = await pg.connect();

        const result = await client.query('SELECT * from get_repositories_by_filter($1, $2, $3, $4, $5)', [
            userId,
            by_user ?? -1,
            title ? `${title}%` : '',
            is_rw,
            is_rwa,
        ]);

        client.release();

        if (result.rows.length) {
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
        }
    },
    getRepositoryById: async (id: number, userId: number): Promise<({ rootFiles: File[] } & Repository) | void> => {
        const user = await UserFns.getUserById(userId);

        if (!user) {
            return;
        }

        const client = await pg.connect();

        const result = await client.query('SELECT * from get_repository_by_id($1, $2)', [userId, id]);

        client.release();

        if (!result.rows.length) {
            return;
        }

        const git = new Git(
            {
                email: user.email,
                username: user.username,
            },
            result.rows[0].title,
        );

        const rootFiles = (await git.getFolderFiles()) ?? [];

        return {
            id: result.rows[0].id,
            path_to_repository: result.rows[0].path_to_repository,
            is_private: result.rows[0].is_private,
            user_id: result.rows[0].user_id,
            title: result.rows[0].title,
            rubric_id: result.rows[0].rubric_id,
            map_id: result.rows[0].map_id,
            rootFiles,
        };
    },
    getFilePath: async (id: number, userId: number, pathToFile: string): Promise<string | void> => {
        const user = await UserFns.getUserById(userId);

        if (!user) {
            return;
        }

        const client = await pg.connect();

        const result = await client.query('SELECT * from get_repository_by_id($1, $2)', [userId, id]);

        client.release();

        if (!result.rows.length) {
            return;
        }

        return pathToFile;
    },
};
