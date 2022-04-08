import { FetchStatus, Repository } from '../../types';

export type RepositoriesListPageEvents =
    | { type: 'repositories-list-page/repositories-list/success'; data: { repository: Repository; version: string }[] }
    | { type: 'repositories-list-page/repositories-list/loading' }
    | { type: 'repositories-list-page/repositories-list/error' };

export type RepositoriesListPageStore = {
    repositories: { repository: Repository; version: string }[];
    fetchStatus: FetchStatus;
};

const initialState: RepositoriesListPageStore = {
    repositories: [],
    fetchStatus: FetchStatus.none,
};

export const repositoriesListPageReducer = (
    state: RepositoriesListPageStore = initialState,
    event: RepositoriesListPageEvents,
): RepositoriesListPageStore => {
    if (event.type === 'repositories-list-page/repositories-list/success') {
        const result = { ...state };

        result.repositories = event.data ?? [];
        result.fetchStatus = FetchStatus.successed;

        return result;
    }

    if (event.type === 'repositories-list-page/repositories-list/loading') {
        const result = { ...state };

        result.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repositories-list-page/repositories-list/error') {
        const result = { ...state };

        result.fetchStatus = FetchStatus.error;

        return result;
    }

    return state;
};
