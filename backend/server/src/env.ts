import { config as getDotEnv } from 'dotenv';

getDotEnv();

const defaultHost = '127.0.0.1';
const defaultPort = 8000;

export const port = Number(process.env.PORT ?? defaultPort);
export const host = process.env.HOST ?? defaultHost;

export const baseGitPath = process.env.GIT_PATH ?? '/repositories';
