import { ServerResponse } from 'http';
import fs from 'fs';
import path from 'path';
import mime from 'mime';
import archive from 'archiver';

import { Code } from '../types';
import { baseGitPath } from '../env';
import { noop } from './helpers';

const fsAsync = fs.promises;

export const getBadRequestResponse = (
    response: ServerResponse,
    error: string,
    description: string,
    isForField?: boolean,
) => {
    const body = JSON.stringify({
        error,
        description,
        isForField,
    });

    response
        .writeHead(Code.badRequest, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getUnauthorizedResponse = (response: ServerResponse, error: string, description: string) => {
    const body = JSON.stringify({
        code: Code.unauthorized,
        error,
        description,
    });

    response
        .writeHead(Code.unauthorized, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getOkResponse = <T>(response: ServerResponse, data?: T) => {
    const body = JSON.stringify(data ?? {});

    response
        .writeHead(Code.ok, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getInternalServerErrorResponse = (response: ServerResponse, error: string, description: string) => {
    const body = JSON.stringify({
        error,
        description,
    });

    response
        .writeHead(Code.internalServerError, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getServerErrorResponse = (response: ServerResponse, error: string, description: string, code: Code) => {
    const body = JSON.stringify({
        error,
        description,
    });

    response
        .writeHead(code, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getDownloadResponse = async (response: ServerResponse, pathToFile: string) => {
    const mimetype = mime.lookup(pathToFile);

    response.setHeader('Content-type', mimetype);

    const isDir = await fsAsync.stat(pathToFile).then((stat) => stat.isDirectory());

    if (isDir) {
        const filename = path.basename(pathToFile);
        const pathToZipFile = `${baseGitPath}/temp/${filename}.zip`;
        const output = fs.createWriteStream(pathToZipFile);
        const archiver = archive('zip');

        archiver.pipe(output);
        archiver.directory(pathToFile, false);

        await archiver.finalize();

        const filestream = fs.createReadStream(pathToZipFile);
        filestream.pipe(response);

        response.on('close', () => fs.unlink(pathToZipFile, noop));

        return;
    }

    const filestream = fs.createReadStream(pathToFile);
    filestream.pipe(response);
};

export const normalizeErrorCode = (code: string | number | undefined) => {
    if (!code || typeof code === 'string') {
        return Code.internalServerError;
    } 

    return Object.values(Code).includes(code) ? code : Code.internalServerError;
}
