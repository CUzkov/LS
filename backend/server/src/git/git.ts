import path from 'path';
import fsSync from 'fs';
import simpleGit, { SimpleGit } from 'simple-git';

const fsAsync = fsSync.promises;

import { baseGitPath } from '../env';
import { errors } from '../constants/errors';

export type File = {
    name: string;
    isDir: boolean;
    hasSubFiles: boolean;
    pathToFile: string[];
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

    async getFolderFiles(pathToDir: string[] = []): Promise<File[]> {
        const files: Array<File & { index?: number }> = [];

        const fullPathToDir = path.join(this.path, ...pathToDir);
        let dir: string[] = [];

        try {
            dir = await fsAsync.readdir(fullPathToDir);
        } catch (error) {
            const e = error as { message: string };
            throw errors.readFileError(e.message);
        }

        const dirPromises = dir.map(async (file, index) => {
            if (file === '.git') {
                return;
            }

            const pathToFile = path.join(fullPathToDir, file);

            const dirStat = await fsAsync.stat(pathToFile);
            const isDir = dirStat.isDirectory();

            let hasSubFiles = false;

            if (isDir) {
                try {
                    const dir = await fsAsync.readdir(pathToFile);
                    hasSubFiles = Boolean(dir.length);
                } catch (error) {
                    const e = error as Error;
                    throw errors.readFileError(e.message);
                }
            }

            files.push({
                name: file,
                hasSubFiles,
                isDir,
                pathToFile: path.join(...pathToDir, file).split(path.sep),
                index,
            });
        });

        await Promise.all(dirPromises);

        return files
            .sort((a, b) => {
                const isBothDir = a.isDir && b.isDir;

                if (isBothDir) {
                    return (a.index ?? 0) - (b.index ?? 0);
                }

                return (a.isDir && -1) || 1;
            })
            .map((file) => {
                delete file.index;
                return file;
            });
    }

    getFullPathToFile(pathToFile: string[]): string {
        return path.join(this.path, ...pathToFile);
    }
}
