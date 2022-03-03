import { FetchStatus, Repository } from '../../types';

export interface IRepositoriesListPageD {
    repositories?: {
        data: Repository[];
    };
}

export type RepositoriesListPageEvents =
    | { type: 'repositories-list-page/repositories-list/success'; data: IRepositoriesListPageD }
    | { type: 'repositories-list-page/repositories-list/loading' }
    | { type: 'repositories-list-page/repositories-list/error' };

export type RepositoriesListPageStore = {
    repositories: {
        data: Repository[];
        fetchStatus: FetchStatus;
    };
};

const initialState: RepositoriesListPageStore = {
    repositories: {
        data: [],
        fetchStatus: FetchStatus.loading,
    },
};

export const repositoriesListPageReducer = (
    state: RepositoriesListPageStore = initialState,
    event: RepositoriesListPageEvents,
): RepositoriesListPageStore => {
    if (event.type === 'repositories-list-page/repositories-list/success') {
        const result = { ...state };

        result.repositories = {
            data: event.data.repositories?.data ?? [],
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'repositories-list-page/repositories-list/loading') {
        const result = { ...state };

        result.repositories.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repositories-list-page/repositories-list/error') {
        const result = { ...state };

        result.repositories.fetchStatus = FetchStatus.error;

        return result;
    }

    return state;
};
