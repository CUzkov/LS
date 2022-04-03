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
    | { type: 'repository-page/set-path'; data: string[] };

export type RepositoryPageStore = {
    repository?: Repository;
    repositoryFetchStatus: FetchStatus;
    files: FileMeta[];
    dirs: DirMeta[];
    filesAndDirsFetchStatus: FetchStatus;
    currentPath: string[];
};

const initialState: RepositoryPageStore = {
    repository: undefined,
    repositoryFetchStatus: FetchStatus.none,
    files: [],
    dirs: [],
    filesAndDirsFetchStatus: FetchStatus.none,
    currentPath: [],
};

export const repositoryPageReducer = (
    state: RepositoryPageStore = initialState,
    event: RepositoryPageEvents,
): RepositoryPageStore => {
    if (event.type === 'repository-page/repository/success') {
        const result = { ...state };

        result.repository = event.data;
        result.repositoryFetchStatus = FetchStatus.successed;

        return result;
    }

    if (event.type === 'repository-page/repository/loading') {
        const result = { ...state };

        result.repositoryFetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/repository/error') {
        const result = { ...state };

        result.repositoryFetchStatus = FetchStatus.error;

        return result;
    }

    if (event.type === 'repository-page/files-and-dirs/success') {
        const result = { ...state };

        result.files = [...event.data.files];
        result.dirs = [...event.data.dirs];
        result.filesAndDirsFetchStatus = FetchStatus.successed;

        return result;
    }

    if (event.type === 'repository-page/files-and-dirs/loading') {
        const result = { ...state };

        result.filesAndDirsFetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/files-and-dirs/error') {
        const result = { ...state };

        result.filesAndDirsFetchStatus = FetchStatus.error;

        return result;
    }

    if (event.type === 'repository-page/set-path') {
        const result = { ...state };

        result.currentPath = [...event.data];

        return result;
    }

    if (event.type === 'repository-page/file/add') {
        const result = { ...state };

        if (event.data.isBeDeleted) {
            result.files = result.files.map((file) => (file.name === event.data.file.name ? event.data.file : file));
        } else {
            result.files = result.files.concat([event.data.file]).sort(sortFiles);
        }

        return result;
    }

    if (event.type === 'repository-page/file/delete') {
        const result = { ...state };

        if ('pathToFile' in event.data) {
            result.files = result.files.filter((file) => file.name !== event.data.name);
        } else {
            result.dirs = result.dirs.filter((dir) => dir.name !== event.data.name);
        }

        return result;
    }

    if (event.type === 'repository-page/file/rename') {
        const result = { ...state };

        result.files = result.files
            .map((file) => (file.name === event.data.oldFile.name ? event.data.newFile : file))
            .sort(sortFiles);

        return result;
    }

    if (event.type === 'repository-page/dir/rename') {
        const result = { ...state };

        result.dirs = result.dirs
            .map((dir) => (dir.name === event.data.oldDir.name ? event.data.newDir : dir))
            .sort(sortFiles);

        return result;
    }

    return state;
};
