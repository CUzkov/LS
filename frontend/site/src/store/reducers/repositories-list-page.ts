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
    const result = { ...state };

    if (event.type === 'repositories-list-page/repositories-list/success') {
        result.repositories = event.data ?? [];
        result.fetchStatus = FetchStatus.successed;
    }

    if (event.type === 'repositories-list-page/repositories-list/loading') {
        result.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repositories-list-page/repositories-list/error') {
        result.fetchStatus = FetchStatus.error;
    }

    return result;
};
