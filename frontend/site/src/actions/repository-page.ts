import { getDirKeyByPath } from 'pages/repository-page/repository-page.utils';

import { ajax } from '../ajax';
import { DirMeta, DirStatus, Empty, FileMeta, FileStatus, IServerError, Repository } from 'types';
import { Dispatch, store } from '../store';

const REPOSITORY_BY_ID_URL = '/api/repository/id';
const GET_FILES_BY_FULL_DIR_PATH_URL = '/api/repository/files';
const GET_DRAFT_FILES_BY_FULL_DIR_PATH = '/api/repository/draft/files';
const RENAME_FILE_OR_DIR_IN_REPOSITORY = '/api/repository/draft/rename';
const DELETE_FILE_OR_DIR_FROM_REPOSITORY = '/api/repository/draft/delete';
const ADD_FILE_TO_REPOSITORY = '/api/repository/draft/add/file';
const ADD_DIR_TO_REPOSITORY = '/api/repository/draft/add/dir';
const SAVE_REPOSITORY_VERSION = '/api/repository/version/save';
const GET_ALL_REPOSITORY_VERSIONS = '/api/repository/version/all';

type GetRepositoryByIdQP = {
    id: number;
    version?: string;
};

type GetRepositoryByIdRD = {
    repository: Repository;
    version: string;
};

export const getPageRepositoriesById = async (id: number, version?: string) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/repository/loading' });

    let response: GetRepositoryByIdRD | undefined;

    try {
        response = await ajax.get<GetRepositoryByIdRD, GetRepositoryByIdQP>({
            url: REPOSITORY_BY_ID_URL,
            queryParams: { id, version },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-page/repository/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'repository-page/repository/success',
        data: response,
    });
};

type GetFilesAndDirsByDirPathQP = {
    repositoryId: number;
    pathToDir?: string;
    dirName?: string;
    version?: string;
};

type GetFilesAndDirsByDirPathRD = {
    files: {
        name: string;
        pathToFile: string[];
        status: FileStatus;
    }[];
    dirs: {
        name: string;
        pathToDir: string[];
        status: DirStatus;
    }[];
};

export const getFilesByPath = async (pathToDir: string[], dirName: string, isDraft: boolean, version?: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository, repositoryVersion },
    } = store.getState();

    if (!repository?.id) {
        return;
    }

    dispath({ type: 'repository-page/files-and-dirs/loading' });

    let response: GetFilesAndDirsByDirPathRD | undefined;

    try {
        response = await ajax.get<GetFilesAndDirsByDirPathRD, GetFilesAndDirsByDirPathQP>({
            url: isDraft ? GET_DRAFT_FILES_BY_FULL_DIR_PATH : GET_FILES_BY_FULL_DIR_PATH_URL,
            queryParams: {
                pathToDir: pathToDir.join('~'),
                dirName,
                repositoryId: repository?.id ?? -1,
                version: version ?? repositoryVersion,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-page/files-and-dirs/error' });
        dispath({
            type: 'logger/add-log',
            data: { title: e.name, description: e.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'repository-page/files-and-dirs/success', data: response });
};

type AddFileToRepositoryRD = {
    name: string;
    pathToFile: string[];
    status: FileStatus;
};

export const addFile = async (file: File, isBeDeleted?: boolean) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { currentPath, repository },
    } = store.getState();

    const fileForm = new FormData();

    fileForm.append('file', file);
    fileForm.append('repositoryId', String(repository?.id ?? -1));
    fileForm.append('pathToDir', getDirKeyByPath(currentPath));

    let response: AddFileToRepositoryRD | undefined;

    try {
        response = await ajax.post<FormData, AddFileToRepositoryRD, Empty>({
            url: ADD_FILE_TO_REPOSITORY,
            data: fileForm,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({
            type: 'logger/add-log',
            data: { title: e.name, description: e.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'repository-page/file/add', data: { file: response, isBeDeleted } });
};

export const changeFilesDirPath = (newFullPathToDir: string[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/set-path', data: newFullPathToDir.filter((path) => path !== '.') });
};

type DeleteFileFromRepositoryD = {
    name: string;
    repositoryId: number;
    pathToFile?: string;
};

type DeleteFileFromRepositoryRD =
    | {
          name: string;
          pathToFile: string[];
          status: FileStatus;
      }
    | {
          name: string;
          pathToDir: string[];
          status: DirStatus;
      };

export const deleteFileOrDir = async (fileOrDir: FileMeta | DirMeta) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    const isFile = 'pathToFile' in fileOrDir;

    let response: DeleteFileFromRepositoryRD | undefined;

    try {
        response = await ajax.post<DeleteFileFromRepositoryD, DeleteFileFromRepositoryRD, Empty>({
            url: DELETE_FILE_OR_DIR_FROM_REPOSITORY,
            data: {
                name: fileOrDir.name,
                pathToFile: (isFile ? fileOrDir.pathToFile : fileOrDir.pathToDir).join('~'),
                repositoryId: repository?.id ?? -1,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        dispath({
            type: 'logger/add-log',
            data: {
                title: isFile ? 'Ошибка удаления файла!' : 'Ошибка удаления папки!',
                description: isFile ? `Файл ${fileOrDir.name} не удалён` : `Папка ${fileOrDir.name} не удалёна`,
                type: 'error',
            },
        });
        return;
    }

    dispath({ type: 'repository-page/file/delete', data: response });
};

type RenameFileInRepositoryD = {
    name: string;
    pathToFile: string;
    repositoryId: number;
    newName: string;
};

type RenameFileInRepositoryRD =
    | {
          name: string;
          pathToFile: string[];
          status: FileStatus;
      }
    | {
          name: string;
          pathToDir: string[];
          status: DirStatus;
      };

export const renameFileOrDir = async (fileOrDir: FileMeta | DirMeta, newName: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository, currentPath },
    } = store.getState();

    const isFile = 'pathToFile' in fileOrDir;

    let response: RenameFileInRepositoryRD | undefined;

    try {
        response = await ajax.post<RenameFileInRepositoryD, RenameFileInRepositoryRD, Empty>({
            url: RENAME_FILE_OR_DIR_IN_REPOSITORY,
            data: {
                name: fileOrDir.name,
                pathToFile: currentPath.join('~'),
                repositoryId: repository?.id ?? -1,
                newName,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        dispath({
            type: 'logger/add-log',
            data: {
                title: `Ошибка переименования ${isFile ? 'файла' : 'папки'}!`,
                description: isFile
                    ? `Файл ${fileOrDir.name} не переименован`
                    : `Папка ${fileOrDir.name} не переименована`,
                type: 'error',
            },
        });
        return;
    }

    if ('pathToFile' in fileOrDir && 'pathToFile' in response) {
        dispath({ type: 'repository-page/file/rename', data: { oldFile: fileOrDir, newFile: response } });
    } else if ('pathToDir' in fileOrDir && 'pathToDir' in response) {
        dispath({ type: 'repository-page/dir/rename', data: { oldDir: fileOrDir, newDir: response } });
    }
};

type AddDirToRepositoryD = {
    repositoryId: number;
    newDirName: string;
    pathToDir?: string;
};

type AddDirToRepositoryRD = {
    name: string;
    pathToDir: string[];
    status: DirStatus;
};

export const addDirToRepository = async (newDirName: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { currentPath, repository },
    } = store.getState();

    if (!repository?.id) {
        return;
    }

    let response: AddDirToRepositoryRD | undefined;

    try {
        response = await ajax.post<AddDirToRepositoryD, AddDirToRepositoryRD, Empty>({
            url: ADD_DIR_TO_REPOSITORY,
            data: {
                newDirName,
                repositoryId: repository.id,
                pathToDir: currentPath.join('~'),
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        dispath({
            type: 'logger/add-log',
            data: {
                title: 'Ошибка создания новой папки!',
                description: `Папка ${newDirName} не создана`,
                type: 'error',
            },
        });
        return;
    }

    dispath({ type: 'repository-page/dir/add', data: response });
};

type SaveRepositoryVersionD = {
    repositoryId: number;
    versionSummary: string;
    version: [number, number, number];
};

type SaveRepositoryVersionRD = {
    version: string;
};

export const saveRepositoryVersion = async (
    versionSummary: string,
    version: [number, number, number],
): Promise<string | undefined> => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    if (!repository?.id) {
        return;
    }

    let response: SaveRepositoryVersionRD | undefined;

    try {
        response = await ajax.post<SaveRepositoryVersionD, SaveRepositoryVersionRD, Empty>({
            url: SAVE_REPOSITORY_VERSION,
            data: {
                repositoryId: repository.id,
                version,
                versionSummary,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        dispath({
            type: 'logger/add-log',
            data: { title: 'Ошибка создания новой версии!', description: 'Новая версия не создана', type: 'error' },
        });
        return;
    }

    return response.version;
};

type GetAllRepositoryVersionsQP = {
    repositoryId: number;
};

type GetAllRepositoryVersionsRD = string[];

export const getAllVersions = async () => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositoryPage: { repository },
    } = store.getState();

    if (!repository?.id) {
        return;
    }

    dispath({ type: 'repository-page/version/loading' });

    let response: GetAllRepositoryVersionsRD | undefined;

    try {
        response = await ajax.get<GetAllRepositoryVersionsRD, GetAllRepositoryVersionsQP>({
            url: GET_ALL_REPOSITORY_VERSIONS,
            queryParams: {
                repositoryId: repository.id,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-page/version/error' });

        dispath({
            type: 'logger/add-log',
            data: { title: e.name, description: e.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'repository-page/version/success', data: response });
};

export const clearRepositoryPage = () => {
    const dispath: Dispatch = store.dispatch;
    dispath({ type: 'repository-page/clear' });
};

export const setRepositoryVersion = (version: string) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-page/repository/version', data: version });
};
