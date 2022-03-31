import { FetchStatus, FileMeta, Repository } from '../../types';

type ActionRepositoryLoadSuccess = Repository;

type ActionFilesLoadSuccess = FileMeta[];

export type RepositoryPageEvents =
    | { type: 'repository-page/repository/success'; data: ActionRepositoryLoadSuccess }
    | { type: 'repository-page/repository/loading' }
    | { type: 'repository-page/repository/error' }
    | { type: 'repository-page/files/success', data: ActionFilesLoadSuccess  }
    | { type: 'repository-page/files/loading' }
    | { type: 'repository-page/files/error' };

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

    return state;
};
