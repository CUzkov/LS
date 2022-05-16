import path from 'path';
import fsSync from 'fs';
import fse from 'fs-extra';
import simpleGit, { SimpleGit } from 'simple-git';

const fsAsync = fsSync.promises;

import { baseGitPath } from '../../env';
import { Mutex } from '../mutex';
import { ServerError, errorNames } from '../server-error';
import { Code } from '../../types';
import { formatTitleToPath } from '../paths';

export enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists',
    rename = 'rename',
}

export type FileMeta = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
};

export enum DirStatus {
    addOrRename = 'addOrRename',
    modify = 'modify',
    delete = 'delete',
    none = 'none',
}

export type DirMeta = {
    status: DirStatus;
    pathToDir: string[];
    name: string;
};

type GitUser = {
    username: string;
    email: string;
};

const gitMutex = new Mutex();

export class Git {
    readonly user: GitUser;
    readonly repositoryName: string;
    readonly path: string;
    readonly gitCore: SimpleGit;
    readonly version?: string;
    readonly pathToOriginalVersion?: string;

    constructor(user: GitUser, repositoryName: string, isDraft?: boolean, versionOf?: { version: string; git: Git }) {
        this.user = {
            email: user.email,
            username: user.username,
        };
        this.repositoryName = formatTitleToPath(repositoryName);

        if (isDraft) {
            this.path = path.join(baseGitPath, 'draft', this.user.username, this.repositoryName);
        } else if (versionOf) {
            this.version = versionOf.version;
            this.path = path.join(baseGitPath, 'version-of', this.user.username, this.repositoryName, this.version);
        } else {
            this.path = path.join(baseGitPath, this.user.username, this.repositoryName);
        }

        fse.ensureDirSync(this.path);

        this.gitCore = simpleGit({
            baseDir: this.path,
            binary: 'git',
            maxConcurrentProcesses: 1,
        });
    }

    async init() {
        await this._capture();

        if (this.version) {
            await this.gitCore.checkout(this.version ?? '');
        } else {
            await this.gitCore.init();
        }

        this._release();
    }

    async _capture() {
        await new Promise<void>((reslove) => {
            gitMutex.lock({ releaseCallback: reslove, repositoryFullPath: this.getAbsPathToFile([]) });
        });
    }

    _release() {
        gitMutex.unlock({ repositoryFullPath: this.getAbsPathToFile([]) });
    }

    async _add() {
        await this.gitCore.add('.');
    }

    _getFormattedVersion(version: [number, number, number]) {
        return `v${version.join('.')}`;
    }

    _getFileStatus(index?: string): FileStatus {
        switch (index) {
            case 'A':
                return FileStatus.add;
            case 'M':
                return FileStatus.modify;
            case 'D':
                return FileStatus.delete;
            case 'R':
                return FileStatus.rename;
            default:
                return FileStatus.commit;
        }
    }

    _getDraftAbsPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }

    async _getFileStatusByFullPathToFile(fullPathToFile: string): Promise<FileStatus> {
        const statuses = await this._getNormalizeFileStatuses();

        const status = statuses[fullPathToFile];

        if (!status) {
            return FileStatus.noExists;
        }

        return status.status;
    }

    async _getNormalizeFileStatuses() {
        const repositoryStatus = await this.gitCore.status();

        const result: Record<
            string,
            {
                status: FileStatus;
                pathToFile: string;
                name: string;
            }
        > = {};

        repositoryStatus.files.forEach((fileStatus) => {
            if (fileStatus.index === 'R') {
                const [, newPath] = path.normalize(fileStatus.path).split(' -> ');

                const normalizeNewPath = newPath.replace(/"/g, '');

                result[normalizeNewPath] = {
                    status: this._getFileStatus(fileStatus.index),
                    pathToFile: path.dirname(normalizeNewPath),
                    name: path.basename(normalizeNewPath),
                };

                return;
            }

            const currFullPathToFileStr = path.normalize(fileStatus.path).replace(/"/g, '');

            result[currFullPathToFileStr] = {
                status: this._getFileStatus(fileStatus.index),
                pathToFile: path.dirname(currFullPathToFileStr),
                name: path.basename(currFullPathToFileStr),
            };
        });

        return result;
    }

    _getDirWithStatusByFullPathToDir(
        statusesEntries: [
            string,
            {
                status: FileStatus;
                pathToFile: string;
                name: string;
            },
        ][],
        fullPathToDir: string,
    ): DirMeta {
        let status: DirStatus;
        const sep = path.sep;
        const currDirStatuses = statusesEntries.filter(
            ([path, { status }]) => status !== FileStatus.delete && path.startsWith(fullPathToDir + sep),
        );

        if (!currDirStatuses.length) {
            status = DirStatus.none;
        } else if (
            currDirStatuses.every(([, { status }]) => status === FileStatus.add || status === FileStatus.rename)
        ) {
            status = DirStatus.addOrRename;
        } else {
            status = DirStatus.modify;
        }

        return {
            name: path.basename(fullPathToDir),
            pathToDir: path.dirname(fullPathToDir).split(path.sep),
            status,
        };
    }

    // внешние ручки для использования

    // коммитит изменения в драфт-репозитории и переносит их в обычный
    async saveVersion(git: Git, commitMessage: string, version: [number, number, number]): Promise<string> {
        await git._capture();
        await this._capture();

        const formattedVersion = this._getFormattedVersion(version);

        await this._add();
        await this.gitCore.commit(commitMessage);
        await this.gitCore.addTag(formattedVersion);

        const absFullPathToDir = git.getAbsPathToFile([]);
        const absFullPathToDirVersionOf = path.join(
            baseGitPath,
            'version-of',
            this.user.username,
            this.repositoryName,
            formattedVersion,
        );

        const absFullPathToDirDraft = this.getAbsPathToFile([]);

        await fse.remove(absFullPathToDir);
        await fse.mkdir(absFullPathToDir, { recursive: true });
        await fse.copy(absFullPathToDirDraft, absFullPathToDir, { recursive: true });

        await fse.mkdir(absFullPathToDirVersionOf, { recursive: true });
        await fse.copy(absFullPathToDirDraft, absFullPathToDirVersionOf, { recursive: true });

        git._release();
        this._release();

        return formattedVersion;
    }

    async getAllVersions(): Promise<string[]> {
        const tags = await this.gitCore.tags();
        return tags.all.reverse();
    }

    async addDir(pathToDir: string[], newDirName: string) {
        await this._capture();

        try {
            await fsAsync.mkdir(this.getAbsPathToFile([...pathToDir, newDirName]));
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.cannotCreateNewDir, code: Code.badRequest, message: e.message });
        }

        this._release();
    }

    async addFile(pathToFile: string[], fileName: string, absFullPathToFileTmp: string): Promise<FileMeta> {
        await this._capture();

        const absFullPathToFile = path.join(this._getDraftAbsPathToFile(pathToFile), fileName);

        await fse.move(absFullPathToFileTmp, absFullPathToFile, { overwrite: true });

        await this._add();

        const status = await this._getFileStatusByFullPathToFile(path.join(...pathToFile, fileName));

        this._release();

        return {
            name: fileName,
            pathToFile,
            status,
        };
    }

    async deleteFileOrDir(pathToFileOrDir: string[], fileOrDirName: string): Promise<FileMeta | DirMeta> {
        await this._capture();

        const absFullPathToFile = this.getAbsPathToFile([...pathToFileOrDir, fileOrDirName]);
        const isDir = (await fse.stat(absFullPathToFile)).isDirectory();

        try {
            await fse.remove(absFullPathToFile);
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.deleteFileError, code: Code.badRequest, message: e.message });
        }

        await this._add();

        this._release();

        return {
            name: fileOrDirName,
            ...(isDir
                ? { pathToDir: pathToFileOrDir, status: DirStatus.delete }
                : { pathToFile: pathToFileOrDir, status: FileStatus.delete }),
        };
    }

    async renameFileOrDir(pathToFileOrDir: string[], fileOrDirName: string, newFileOrDirName: string) {
        await this._capture();

        const absFullPathToFile = this._getDraftAbsPathToFile([...pathToFileOrDir, fileOrDirName]);
        const absFullPathToFileNew = this._getDraftAbsPathToFile([...pathToFileOrDir, newFileOrDirName]);

        const isDir = (await fse.stat(absFullPathToFile)).isDirectory();

        try {
            await fse.rename(absFullPathToFile, absFullPathToFileNew);
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.renameFileOrDir, code: Code.badRequest, message: e.message });
        }

        await this._add();

        const fullPathToFileOrDir = path.join(...pathToFileOrDir, newFileOrDirName);

        if (isDir) {
            const statusesEntries = Object.entries(await this._getNormalizeFileStatuses());
            const status = this._getDirWithStatusByFullPathToDir(statusesEntries, fullPathToFileOrDir).status;

            this._release();

            return {
                name: newFileOrDirName,
                pathToDir: pathToFileOrDir,
                status,
            };
        }

        const status = await this._getFileStatusByFullPathToFile(fullPathToFileOrDir);

        this._release();

        return {
            name: newFileOrDirName,
            pathToFile: pathToFileOrDir,
            status,
        };
    }

    async getDirFiles(pathToDir: string[] = [], dirName: string): Promise<{ files: FileMeta[]; dirs: DirMeta[] }> {
        const files: FileMeta[] = [];
        const dirs: DirMeta[] = [];

        const absFullPathToDir = path.join(this.path, ...pathToDir, dirName);
        const fullPathToDir = pathToDir.concat(dirName).filter(Boolean);
        let currDirFiles: string[] = [];

        try {
            currDirFiles = await fsAsync.readdir(absFullPathToDir);
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.deleteFileError, code: Code.badRequest, message: e.message });
        }

        const dirPromises = currDirFiles.map(async (currFileName) => {
            if (currFileName === '.git') {
                return;
            }

            const currAbsFullPathToFile = path.join(absFullPathToDir, currFileName);
            const currFileStat = await fsAsync.stat(currAbsFullPathToFile);
            const isDir = currFileStat.isDirectory();

            if (isDir) {
                dirs.push({
                    name: currFileName,
                    pathToDir: fullPathToDir,
                    status: DirStatus.none,
                });
            } else {
                files.push({
                    name: currFileName,
                    pathToFile: fullPathToDir,
                    status: FileStatus.commit,
                });
            }
        });

        await Promise.all(dirPromises);

        return {
            dirs: dirs.sort((a, b) => (a.name > b.name ? 1 : -1)),
            files: files.sort((a, b) => (a.name > b.name ? 1 : -1)),
        };
    }

    async getDraftDirFiles(
        pathToDir: string[] = [],
        dirName: string,
    ): Promise<{ files: FileMeta[]; dirs: DirMeta[]; deletedFiles: FileMeta[] }> {
        const files: FileMeta[] = [];
        const dirs: DirMeta[] = [];

        const absFullPathToDir = path.join(this.path, ...pathToDir, dirName);
        const fullPathToDir = pathToDir.concat(dirName).filter(Boolean);
        let currDirFiles: string[] = [];

        try {
            currDirFiles = await fsAsync.readdir(absFullPathToDir);
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.readFileError, code: Code.badRequest, message: e.message });
        }

        const statuses = await this._getNormalizeFileStatuses();
        const statusesEntries = Object.entries(statuses);

        const dirPromises = currDirFiles.map(async (currFileName) => {
            if (currFileName === '.git') {
                return;
            }

            const currAbsFullPathToFile = path.join(absFullPathToDir, currFileName);
            const currFileStat = await fsAsync.stat(currAbsFullPathToFile);
            const isDir = currFileStat.isDirectory();
            const currFullPathToFile = path.join(...fullPathToDir.concat(currFileName));

            if (isDir) {
                dirs.push(this._getDirWithStatusByFullPathToDir(statusesEntries, currFullPathToFile));
            } else {
                const status = statuses[currFullPathToFile]?.status ?? FileStatus.commit;

                files.push({
                    name: currFileName,
                    pathToFile: fullPathToDir,
                    status,
                });
            }
        });

        await Promise.all(dirPromises);

        return {
            dirs: dirs.sort((a, b) => (a.name > b.name ? 1 : -1)),
            files: files.sort((a, b) => (a.name > b.name ? 1 : -1)),
            deletedFiles: Object.values(statuses)
                .filter((fileStatus) => fileStatus.status === FileStatus.delete)
                .map(({ name, pathToFile, status }) => ({ name, pathToFile: pathToFile.split(path.sep), status })),
        };
    }

    getAbsPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }

    async getCurrentVersion(): Promise<string> {
        if (!this.version) {
            const tags = await this.gitCore.tags();

            return tags.latest ?? '';
        }

        return this.version;
    }
}
