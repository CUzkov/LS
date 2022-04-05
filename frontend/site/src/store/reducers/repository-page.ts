import { DirMeta, FetchStatus, FileMeta, Repository } from '../../types';

const sortFiles = (a: FileMeta | DirMeta, b: FileMeta | DirMeta) => (a.name > b.name ? 1 : -1);

export type RepositoryPageEvents =
    | { type: 'repository-page/repository/success'; data: Repository }
    | { type: 'repository-page/repository/loading' }
    | { type: 'repository-page/repository/error' }
    | { type: 'repository-page/files-and-dirs/success'; data: { files: FileMeta[]; dirs: DirMeta[] } }
    | { type: 'repository-page/files-and-dirs/loading' }
    | { type: 'repository-page/files-and-dirs/error' }
    | { type: 'repository-page/file/add'; data: { file: FileMeta; isBeDeleted?: boolean } }
    | { type: 'repository-page/file/delete'; data: FileMeta | DirMeta }
    | { type: 'repository-page/file/rename'; data: { oldFile: FileMeta; newFile: FileMeta } }
    | { type: 'repository-page/dir/rename'; data: { oldDir: DirMeta; newDir: DirMeta } }
    | { type: 'repository-page/dir/add'; data: DirMeta }
    | { type: 'repository-page/version/success'; data: string[] }
    | { type: 'repository-page/version/loading' }
    | { type: 'repository-page/version/error' }
    | { type: 'repository-page/clear' }
    | { type: 'repository-page/set-path'; data: string[] };

export type RepositoryPageStore = {
    repository?: Repository;
    repositoryFetchStatus: FetchStatus;
    files: FileMeta[];
    dirs: DirMeta[];
    filesAndDirsFetchStatus: FetchStatus;
    versions: string[];
    versionsFetchStatus: FetchStatus;
    currentPath: string[];
};

const initialState: RepositoryPageStore = {
    repository: undefined,
    repositoryFetchStatus: FetchStatus.none,
    files: [],
    dirs: [],
    filesAndDirsFetchStatus: FetchStatus.none,
    versions: [],
    versionsFetchStatus: FetchStatus.none,
    currentPath: [],
};

export const repositoryPageReducer = (
    state: RepositoryPageStore = initialState,
    event: RepositoryPageEvents,
): RepositoryPageStore => {
    const result = { ...state };

    if (event.type === 'repository-page/repository/success') {
        result.repository = event.data;
        result.repositoryFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'repository-page/repository/loading') {
        result.repositoryFetchStatus = FetchStatus.loading;
        result.repository = undefined;
    }

    if (event.type === 'repository-page/repository/error') {
        result.repositoryFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-page/files-and-dirs/success') {
        result.files = [...event.data.files];
        result.dirs = [...event.data.dirs];
        result.filesAndDirsFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'repository-page/files-and-dirs/loading') {
        result.filesAndDirsFetchStatus = FetchStatus.loading;
        result.files = [];
        result.dirs = [];
    }

    if (event.type === 'repository-page/files-and-dirs/error') {
        result.filesAndDirsFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-page/set-path') {
        result.currentPath = [...event.data];
    }

    if (event.type === 'repository-page/file/add') {
        if (event.data.isBeDeleted) {
            result.files = result.files.map((file) => (file.name === event.data.file.name ? event.data.file : file));
        } else {
            result.files = result.files.concat([event.data.file]).sort(sortFiles);
        }
    }

    if (event.type === 'repository-page/file/delete') {
        if ('pathToFile' in event.data) {
            result.files = result.files.filter((file) => file.name !== event.data.name);
        } else {
            result.dirs = result.dirs.filter((dir) => dir.name !== event.data.name);
        }
    }

    if (event.type === 'repository-page/file/rename') {
        result.files = result.files
            .map((file) => (file.name === event.data.oldFile.name ? event.data.newFile : file))
            .sort(sortFiles);
    }

    if (event.type === 'repository-page/dir/rename') {
        result.dirs = result.dirs
            .map((dir) => (dir.name === event.data.oldDir.name ? event.data.newDir : dir))
            .sort(sortFiles);
    }

    if (event.type === 'repository-page/dir/add') {
        result.dirs = [...result.dirs, event.data].sort(sortFiles);
    }

    if (event.type === 'repository-page/version/loading') {
        result.versionsFetchStatus = FetchStatus.loading;
        result.versions = [];
    }

    if (event.type === 'repository-page/version/error') {
        result.versionsFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-page/version/success') {
        result.versionsFetchStatus = FetchStatus.successed;
        result.versions = event.data;
    }

    if (event.type === 'repository-page/clear') {
        result.repository = undefined;
        result.files = [];
        result.dirs = [];
        result.versions = [];
    }

    return result;
};
