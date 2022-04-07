import { config as getDotEnv } from 'dotenv';

if (!process.env.PROD_ENV) {
    getDotEnv({
        path: '../../.env.dev',
    });
}

export const port = Number(process.env.BACKEND_PORT) || -1;
export const host = process.env.BACKEND_HOST ?? '';

export const redisPort = Number(process.env.REDIS_PORT) ?? -1;
export const redisHost = process.env.REDIS_HOST ?? '';

export const pgPort = Number(process.env.PG_PORT) ?? -1;
export const pgHost = process.env.PG_HOST ?? '';
export const pgPassword = process.env.PG_PASSWORD ?? '';
export const pgUsername = process.env.PG_USER ?? '';

export const baseGitPath = process.env.PATH_TO_REPOSITORIES ?? '';
