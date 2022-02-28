import { FetchStatus, Repository, File } from '../../types';

export interface IRepositoryPageD {
    repository?: {
        data: Repository;
    };
    files?: {
        data: File[];
    };
}

export type RepositoryPageEvents =
    | { type: 'repository-page/repository/success'; data: IRepositoryPageD }
    | { type: 'repository-page/repository/loading' }
    | { type: 'repository-page/repository/error' }
    | { type: 'repository-page/files/success'; data: IRepositoryPageD }
    | { type: 'repository-page/files/loading' }
    | { type: 'repository-page/files/error' };

export type RepositoryPageStore = {
    repository: {
        data?: Repository;
        fetchStatus: FetchStatus;
    };
    files: {
        data?: File[];
        fetchStatus: FetchStatus;
    };
};

const initialState: RepositoryPageStore = {
    repository: {
        data: undefined,
        fetchStatus: FetchStatus.loading,
    },
    files: {
        data: undefined,
        fetchStatus: FetchStatus.loading,
    },
};

export const repositoryPageReducer = (
    state: RepositoryPageStore = initialState,
    event: RepositoryPageEvents,
): RepositoryPageStore => {
    if (event.type === 'repository-page/repository/success') {
        const result = { ...state };

        result.repository = {
            data: event.data.repository?.data,
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'repository-page/repository/loading') {
        const result = { ...state };

        result.repository.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/repository/error') {
        const result = { ...state };

        result.repository.fetchStatus = FetchStatus.error;

        return result;
    }

    if (event.type === 'repository-page/files/success') {
        const result = { ...state };

        result.files = {
            data: event.data.files?.data,
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'repository-page/files/loading') {
        const result = { ...state };

        result.files.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/files/error') {
        const result = { ...state };

        result.files.fetchStatus = FetchStatus.error;

        return result;
    }

    return state;
};
