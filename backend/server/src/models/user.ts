import { pg } from '../database';

export type User = {
    id: string;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
};

export const UserFns = {
    getUserByUsername: async (username: string): Promise<User | void> => {
        const client = await pg.connect();

        const result = await client.query('SELECT * from get_user_by_username($1)', [username]);

        client.release();

        if (result.rows.length) {
            return {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                u_password: result.rows[0].u_password,
                is_admin: result.rows[0].is_admin,
            };
        }
    },
    getUserByEmail: async (email: string): Promise<User | void> => {
        const client = await pg.connect();

        const result = await client.query('SELECT * from get_user_by_email($1)', [email]);

        client.release();

        if (result.rows.length) {
            return {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                u_password: result.rows[0].u_password,
                is_admin: result.rows[0].is_admin,
            };
        }
    },
    getUserById: async (id: number): Promise<User | void> => {
        const client = await pg.connect();

        const result = await client.query('SELECT * from get_user_by_id($1)', [id]);

        client.release();

        if (result.rows.length) {
            return {
                id: result.rows[0].id,
                username: result.rows[0].username,
                email: result.rows[0].email,
                u_password: result.rows[0].u_password,
                is_admin: result.rows[0].is_admin,
            };
        }
    },
};
