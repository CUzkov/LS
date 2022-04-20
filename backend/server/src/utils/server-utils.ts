import { ServerResponse } from 'http';
import fse from 'fs-extra';
import path from 'path';
import mime from 'mime';
import archive from 'archiver';

import { baseGitPath } from '../env';
import { noop } from './helpers';
import { ServerError } from './server-error';
import { Code } from '../types';

export const getServerErrorResponse = (response: ServerResponse, error: ServerError) => {
    const body = error.getStringifyError();

    response
        .writeHead(error.code, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8',
        })
        .end(body);
};

export const getDownloadResponse = async (response: ServerResponse, absFullPathToFile: string) => {
    const mimetype = mime.lookup(absFullPathToFile);
    const filename = path.basename(absFullPathToFile);
    const isDir = (await fse.stat(absFullPathToFile)).isDirectory();

    response.setHeader('Content-type', mimetype);
    response.setHeader(
        'Content-Disposition',
        `attachment; name="file"; filename="${encodeURI(filename + (isDir ? '.zip' : ''))}"`,
    );

    if (isDir) {
        const pathToZipFile = `${baseGitPath}/temp/${new Date().getTime()}`;
        await fse.ensureDir(pathToZipFile);
        const fullPathToZipFile = `${pathToZipFile}/${filename}.zip`;
        const output = fse.createWriteStream(fullPathToZipFile);
        const archiver = archive('zip');

        archiver.pipe(output);
        archiver.directory(absFullPathToFile, false);

        await archiver.finalize();

        const filestream = fse.createReadStream(fullPathToZipFile);
        filestream.pipe(response);

        response.on('close', () => fse.unlink(fullPathToZipFile, noop));

        return;
    }

    const filestream = fse.createReadStream(absFullPathToFile);
    filestream.pipe(response);
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
