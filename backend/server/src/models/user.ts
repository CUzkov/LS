import { QueryResult } from 'pg';

import { errors } from '../constants/errors';
import { pg } from '../database';

import { getUserByIdQ, GetUserByIdQP, GetUserByIdR } from '../database/pg-typings/get-user-by-id';
import { getUserByEmailQ, GetUserByEmailQP, GetUserByEmailR } from '../database/pg-typings/get-user-by-email';
import {
    getUserByUsernameQ,
    GetUserByUsernameQP,
    GetUserByUsernameR,
} from '../database/pg-typings/get-user-by-username';

export type User = {
    id: number;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
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
            throw errors.dbError(e.message);
        }

        if (!result.rowCount) {
            throw errors.noSuchUser404('');
        }

        return result.rows[0];
    },
    getUserByEmail: async (email: string): Promise<User> => {
        let result: QueryResult<GetUserByEmailR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUserByEmailR, GetUserByEmailQP>(getUserByEmailQ, [email]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw errors.dbError(e.message);
        }

        if (!result.rowCount) {
            throw errors.noSuchUser404('');
        }

        return result.rows[0];
    },
    getUserById: async (id: number): Promise<User> => {
        let result: QueryResult<GetUserByIdR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetUserByIdR, GetUserByIdQP>(getUserByIdQ, [id]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw errors.dbError(e.message);
        }

        if (!result.rowCount) {
            throw errors.noSuchUser404('Такой пользователь не найден!');
        }

        return result.rows[0];
    },
};
