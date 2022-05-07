import { FetchStatus, Repository } from '../../types';

export type RepositoriesListPageEvents =
    | {
          type: 'repositories-list-page/repositories-list/success';
          data: { repositories: { repository: Repository; version: string }[]; count: number };
      }
    | { type: 'repositories-list-page/repositories-list/loading' }
    | { type: 'repositories-list-page/repositories-list/error' };

export type RepositoriesListPageStore = {
    repositories: { repository: Repository; version: string }[];
    repositoriesCount: number;
    fetchStatus: FetchStatus;
};

const initialState: RepositoriesListPageStore = {
    repositories: [],
    repositoriesCount: 0,
    fetchStatus: FetchStatus.none,
};

export const repositoriesListPageReducer = (
    state: RepositoriesListPageStore = initialState,
    event: RepositoriesListPageEvents,
): RepositoriesListPageStore => {
    const result = { ...state };

    if (event.type === 'repositories-list-page/repositories-list/success') {
        result.repositories = event.data.repositories;
        result.repositoriesCount = event.data.count;
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
