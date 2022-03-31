import path from 'path';
import fsSync from 'fs';
import simpleGit, { SimpleGit, FileStatusResult } from 'simple-git';

const fsAsync = fsSync.promises;

import { baseGitPath } from '../env';
import { errors } from '../constants/errors';

enum FileStatus {
    commit = 'commit',
    add = 'add',
    modify = 'modify',
    delete = 'delete',
    noExists = 'noExists',
}

export type FileMeta = {
    name: string;
    isDir: boolean;
    pathToFile: string[];
    status: FileStatus;
};

type GitUser = {
    username: string;
    email: string;
};

export class Git {
    readonly user: GitUser;
    readonly repositoryName: string;
    readonly path: string;
    readonly gitCore: SimpleGit;

    constructor(user: GitUser, repositoryName: string) {
        this.user = {
            email: user.email,
            username: user.username,
        };
        this.repositoryName = repositoryName;

        this.path = path.join(baseGitPath, this.user.username, this.repositoryName);

        if (!fsSync.existsSync(this.path)) {
            fsSync.mkdirSync(this.path, { recursive: true });
        }

        this.gitCore = simpleGit({
            baseDir: this.path,
            binary: 'git',
            maxConcurrentProcesses: 5,
        });

        this.gitCore.init();
    }

    async getDirFiles(pathToDir: string[] = [], dirName: string): Promise<FileMeta[]> {
        await this.add();

        const files: FileMeta[] = [];

        const absFullPathToDir = path.join(this.path, ...pathToDir, dirName);
        const fullPathToDir = pathToDir.concat(dirName).filter(Boolean);
        let dirs: string[] = [];

        try {
            dirs = await fsAsync.readdir(absFullPathToDir);
        } catch (error) {
            const e = error as { message: string };
            throw errors.readFileError(e.message);
        }

        const repositoryStatus = await this.gitCore.status();

        const currentDirFilesWithStatus: Record<string, FileStatusResult> = {};
        const currentDirDirsWithStatus: Record<string, FileStatus> = {};
        const fullPathToDirStr = path.join(...fullPathToDir);

        repositoryStatus.files.forEach((fileStatus) => {
            const currFullPathToDirStr = path.normalize(path.dirname(fileStatus.path));
            const currFileName = path.basename(fileStatus.path);
            const currFullPathToFile = path.parse(fileStatus.path);
            const currFullPathToFileStr = path.normalize(path.format(currFullPathToFile));

            currentDirFilesWithStatus[currFullPathToFileStr] = fileStatus;

            if (currFullPathToDirStr === fullPathToDirStr && fileStatus.index === 'D') {
                files.push({
                    isDir: false,
                    name: currFileName,
                    pathToFile: fullPathToDir,
                    status: FileStatus.delete,
                });
            }

            if (currentDirDirsWithStatus[currFullPathToDirStr]) {
                const fileStatusIndex = this.getFileStatus(fileStatus.index);

                if (currentDirDirsWithStatus[currFullPathToDirStr] !== fileStatusIndex) {
                    currentDirDirsWithStatus[currFullPathToDirStr] = FileStatus.modify;
                }
            } else {
                const newStatus = this.getFileStatus(fileStatus.index);
                currentDirDirsWithStatus[currFullPathToDirStr] =
                    newStatus === FileStatus.add ? newStatus : FileStatus.modify;
            }
        });

        const dirPromises = dirs.map(async (currFileName) => {
            if (currFileName === '.git') {
                return;
            }

            const currAbsFullPathToFile = path.join(absFullPathToDir, currFileName);
            const currFileStat = await fsAsync.stat(currAbsFullPathToFile);
            const isDir = currFileStat.isDirectory();
            const currFullPathToFile = path.join(...fullPathToDir.concat(currFileName));

            let status: FileStatus;

            if (isDir) {
                const currDirStatuses = Object.entries(currentDirDirsWithStatus).filter(([path]) =>
                    path.startsWith(currFullPathToFile),
                );

                if (currDirStatuses.length === 0) {
                    status = FileStatus.commit;
                } else if (currDirStatuses.every((status) => status === currDirStatuses[0])) {
                    status = currDirStatuses[0][1] as FileStatus;
                } else {
                    status = FileStatus.modify;
                }
            } else {
                status = this.getFileStatus(currentDirFilesWithStatus[currFullPathToFile]?.index);
            }

            files.push({
                name: currFileName,
                isDir,
                pathToFile: fullPathToDir,
                status,
            });
        });

        await Promise.all(dirPromises);

        return files.sort((a, b) => {
            const isBothDir = a.isDir && b.isDir;
            const isBothFile = !a.isDir && !b.isDir;

            if (isBothDir || isBothFile) {
                return a.name > b.name ? 1 : -1;
            }

            return (a.isDir && -1) || 1;
        });
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
            default:
                return FileStatus.commit;
        }
    }

    getAbsPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }

    async getFileStatusByAbsFullPathToFile(absFullPathToFile: string) {
        const repositoryStatus = await this.gitCore.status();

        const status = repositoryStatus.files
            // fileStatus.path включает в себя имя файла
            .filter((fileStatus) => this.getAbsPathToFile([fileStatus.path]) === absFullPathToFile)?.[0];

        if (!status) {
            return FileStatus.noExists;
        }

        return this.getFileStatus(status.index);
    }
}
