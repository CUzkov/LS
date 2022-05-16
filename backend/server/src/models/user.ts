import { QueryResult } from 'pg';
import { ServerError, errorNames } from '../utils/server-error';
import { Code } from '../types';
import { pg } from '../database';

import { getUserByIdQ, GetUserByIdQP, GetUserByIdR } from '../database/pg-typings/get-user-by-id';
import { getUserByEmailQ, GetUserByEmailQP, GetUserByEmailR } from '../database/pg-typings/get-user-by-email';
import {
    getUserByUsernameQ,
    GetUserByUsernameQP,
    GetUserByUsernameR,
} from '../database/pg-typings/get-user-by-username';
import {
    getUsersByFiltersQ,
    GetUsersByFiltersQP,
    GetUsersByFiltersR,
} from '../database/pg-typings/get-users-by-filters';

export type User = {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
    password?: string;
};

export const UserFns = {
    getUserByUsername: async (username: string): Promise<User> => {
        let result: QueryResult<GetUserByEmailR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUserByUsernameR, GetUserByUsernameQP>(getUserByUsernameQ, [username]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({ name: errorNames.noSuchUser404, code: Code.badRequest });
        }

        return {
            email: result.rows[0].email,
            id: result.rows[0].id,
            isAdmin: result.rows[0].is_admin,
            username: result.rows[0].username,
            password: result.rows[0].u_password,
        };
    },
    getUserByEmail: async (email: string): Promise<User> => {
        let result: QueryResult<GetUserByEmailR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUserByEmailR, GetUserByEmailQP>(getUserByEmailQ, [email]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({ name: errorNames.noSuchUser404, code: Code.badRequest });
        }

        return {
            email: result.rows[0].email,
            id: result.rows[0].id,
            isAdmin: result.rows[0].is_admin,
            username: result.rows[0].username,
            password: result.rows[0].u_password,
        };
    },
    getUserById: async (id: number): Promise<User> => {
        let result: QueryResult<GetUserByIdR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUserByIdR, GetUserByIdQP>(getUserByIdQ, [id]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({ name: errorNames.noSuchUser404, code: Code.badRequest });
        }

        return {
            email: result.rows[0].email,
            id: result.rows[0].id,
            isAdmin: result.rows[0].is_admin,
            username: result.rows[0].username,
            password: result.rows[0].u_password,
        };
    },
    getUsersByFilters: async (
        username: string,
        page: number,
        quantity: number,
        excludeUserIds: number[],
    ): Promise<{ users: User[]; count: number }> => {
        let result: QueryResult<GetUsersByFiltersR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUsersByFiltersR, GetUsersByFiltersQP>(getUsersByFiltersQ, [
                `${username}%`,
                page,
                quantity,
                excludeUserIds,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return {
            users: result.rows.map((user) => ({
                email: user.email,
                id: user.id,
                isAdmin: user.is_admin,
                username: user.username,
            })),
            count: result.rows?.[0]?.users_count ?? 0,
        };
    },
};
