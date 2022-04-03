import path from 'path';
import fsSync from 'fs';
import simpleGit, { SimpleGit } from 'simple-git';

const fsAsync = fsSync.promises;

import { baseGitPath } from '../../env';
import { errors } from '../../constants/errors';
import { Mutex } from '../mutex';

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

    constructor(user: GitUser, repositoryName: string, isDraft?: boolean) {
        this.user = {
            email: user.email,
            username: user.username,
        };
        this.repositoryName = repositoryName;

        this.path = path.join(baseGitPath, isDraft ? 'draft' : '', this.user.username, this.repositoryName);

        if (!fsSync.existsSync(this.path)) {
            fsSync.mkdirSync(this.path, { recursive: true });
        }

        this.gitCore = simpleGit({
            baseDir: this.path,
            binary: 'git',
            maxConcurrentProcesses: 1,
        });

        this.gitCore.init();
    }

    async capture() {
        await new Promise<void>((reslove) => {
            gitMutex.lock({ releaseCallback: reslove, repositoryFullPath: this.getAbsPathToFile([]) });
        });
    }

    release() {
        gitMutex.unlock({ repositoryFullPath: this.getAbsPathToFile([]) });
    }

    async getDraftDirFiles(
        pathToDir: string[] = [],
        dirName: string,
    ): Promise<{ files: FileMeta[]; dirs: DirMeta[]; deletedFiles: FileMeta[] }> {
        await this.add();

        const files: FileMeta[] = [];
        const dirs: DirMeta[] = [];

        const absFullPathToDir = path.join(this.path, ...pathToDir, dirName);
        const fullPathToDir = pathToDir.concat(dirName).filter(Boolean);
        let currDirFiles: string[] = [];

        try {
            currDirFiles = await fsAsync.readdir(absFullPathToDir);
        } catch (error) {
            const e = error as { message: string };
            throw errors.readFileError(e.message);
        }

        const statuses = await this.getNormalizeFileStatuses();
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
                dirs.push(this.getDirWithStatusByFullPathToDir(statusesEntries, currFullPathToFile));
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

    async getDirFiles(pathToDir: string[] = [], dirName: string): Promise<{ files: FileMeta[]; dirs: DirMeta[] }> {
        await this.add();

        const files: FileMeta[] = [];
        const dirs: DirMeta[] = [];

        const absFullPathToDir = path.join(this.path, ...pathToDir, dirName);
        const fullPathToDir = pathToDir.concat(dirName).filter(Boolean);
        let currDirFiles: string[] = [];

        try {
            currDirFiles = await fsAsync.readdir(absFullPathToDir);
        } catch (error) {
            const e = error as { message: string };
            throw errors.readFileError(e.message);
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

    async add() {
        await this.gitCore.add('.');
    }

    getFileStatus(index?: string): FileStatus {
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

    getAbsPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }

    getDraftAbsPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }

    async getFileStatusByFullPathToFile(fullPathToFile: string): Promise<FileStatus> {
        const statuses = await this.getNormalizeFileStatuses();

        const status = statuses[fullPathToFile];

        if (!status) {
            return FileStatus.noExists;
        }

        return status.status;
    }

    async getNormalizeFileStatuses() {
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
                    status: this.getFileStatus(fileStatus.index),
                    pathToFile: path.dirname(normalizeNewPath),
                    name: path.basename(normalizeNewPath),
                };

                return;
            }

            const currFullPathToFileStr = path.normalize(fileStatus.path).replace(/"/g, '');

            result[currFullPathToFileStr] = {
                status: this.getFileStatus(fileStatus.index),
                pathToFile: path.dirname(currFullPathToFileStr),
                name: path.basename(currFullPathToFileStr),
            };
        });

        return result;
    }

    getDirWithStatusByFullPathToDir(
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
        const currDirStatuses = statusesEntries.filter(
            ([path, { status }]) => status !== FileStatus.delete && path.startsWith(fullPathToDir),
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
}
