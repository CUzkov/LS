import { FetchStatus, FileMeta, FileStatus, Repository } from '../../types';

const sortFiles = (a: FileMeta, b: FileMeta) => {
    const isBothDir = a.isDir && b.isDir;
    const isBothFile = !a.isDir && !b.isDir;

    if (isBothDir || isBothFile) {
        return a.name > b.name ? 1 : -1;
    }

    return (a.isDir && -1) || 1;
};

export type RepositoryPageEvents =
    | { type: 'repository-page/repository/success'; data: Repository }
    | { type: 'repository-page/repository/loading' }
    | { type: 'repository-page/repository/error' }
    | { type: 'repository-page/files/success'; data: FileMeta[] }
    | { type: 'repository-page/files/loading' }
    | { type: 'repository-page/files/error' }
    | { type: 'repository-page/file/add'; data: {file: FileMeta, isBeDeleted?: boolean} }
    | { type: 'repository-page/file/delete'; data: FileMeta }
    | { type: 'repository-page/set-path'; data: string[] };

export type RepositoryPageStore = {
    repository?: Repository;
    repositoryFetchStatus: FetchStatus;
    files: FileMeta[];
    filesFetchStatus: FetchStatus;
    currentPath: string[];
};

const initialState: RepositoryPageStore = {
    repository: undefined,
    repositoryFetchStatus: FetchStatus.none,
    files: [],
    filesFetchStatus: FetchStatus.none,
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

    if (event.type === 'repository-page/files/success') {
        const result = { ...state };

        result.files = [...event.data];
        result.filesFetchStatus = FetchStatus.successed;

        return result;
    }

    if (event.type === 'repository-page/files/loading') {
        const result = { ...state };

        result.filesFetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/files/error') {
        const result = { ...state };

        result.filesFetchStatus = FetchStatus.error;

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
            result.files = result.files.map((file) => file.name === event.data.file.name ? event.data.file : file);
        } else {
            result.files = result.files.concat([event.data.file]).sort(sortFiles);
        }

        return result;
    }

    if (event.type === 'repository-page/file/delete') {
        const result = { ...state };

        if (event.data.status === FileStatus.noExists) {
            result.files = result.files.filter((file) => file.name !== event.data.name);
        } else {
            result.files = result.files.map((file) => (file.name === event.data.name ? event.data : file));
        }

        return result;
    }

    return state;
};
