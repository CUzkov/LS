import { FetchStatus } from 'types';

export enum RepositoryNameStatuses {
    free,
    notChecked,
    busy,
}

export type CreateRepositoryFormEvents =
    | { type: 'create-repository-form/error' }
    | { type: 'create-repository-form/success' }
    | { type: 'create-repository-form/loading' }
    | { type: 'create-repository-form/is-repository-name-free/error' }
    | { type: 'create-repository-form/is-repository-name-free/loading' }
    | { type: 'create-repository-form/is-repository-name-free/status'; data: { isFree: boolean } };

export type CreateRepositoryFormStore = {
    repositoryNameStatus: {
        status: RepositoryNameStatuses;
        fetchStatus: FetchStatus;
    };
    fetchStatus: FetchStatus;
};

const initialState: CreateRepositoryFormStore = {
    repositoryNameStatus: {
        status: RepositoryNameStatuses.notChecked,
        fetchStatus: FetchStatus.none,
    },
    fetchStatus: FetchStatus.none,
};

export const createRepositoryFormReducer = (
    state: CreateRepositoryFormStore = initialState,
    event: CreateRepositoryFormEvents,
): CreateRepositoryFormStore => {
    if (event.type === 'create-repository-form/error') {
        return {
            ...state,
            fetchStatus: FetchStatus.error,
        };
    }

    if (event.type === 'create-repository-form/loading') {
        return {
            ...state,
            fetchStatus: FetchStatus.loading,
        };
    }

    if (event.type === 'create-repository-form/success') {
        return {
            ...state,
            fetchStatus: FetchStatus.successed,
        };
    }

    if (event.type === 'create-repository-form/is-repository-name-free/loading') {
        return {
            ...state,
            repositoryNameStatus: {
                ...state.repositoryNameStatus,
                fetchStatus: FetchStatus.loading,
                status: RepositoryNameStatuses.notChecked,
            },
        };
    }

    if (event.type === 'create-repository-form/is-repository-name-free/error') {
        return {
            ...state,
            repositoryNameStatus: {
                ...state.repositoryNameStatus,
                fetchStatus: FetchStatus.error,
            },
        };
    }

    if (event.type === 'create-repository-form/is-repository-name-free/status') {
        return {
            ...state,
            repositoryNameStatus: {
                ...state.repositoryNameStatus,
                fetchStatus: FetchStatus.successed,
                status: event.data.isFree ? RepositoryNameStatuses.free : RepositoryNameStatuses.busy,
            },
        };
    }

    return state;
};
