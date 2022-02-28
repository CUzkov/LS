import { FetchStatus } from 'types';

export type CreateRepositoryFormErrors = '';

export enum RepositoryNameStatuses {
    free,
    notChecked,
    busy,
}

export interface ICreateRepositoryFormD {
    error?: CreateRepositoryFormErrors;
}

export type CreateRepositoryFormEvents =
    | { type: 'create-repository-form/failed' }
    | { type: 'create-repository-form/success' }
    | { type: 'create-repository-form/loading' }
    | { type: 'create-repository-form/error'; data: ICreateRepositoryFormD }
    | { type: 'create-repository-form/is-repository-name-free/failed' }
    | { type: 'create-repository-form/is-repository-name-free/loading' }
    | { type: 'create-repository-form/is-repository-name-free/status'; data: { isFree: boolean } };

export type CreateRepositoryFormStore = {
    error: CreateRepositoryFormErrors;
    repositoryNameStatus: {
        status: RepositoryNameStatuses;
        fetchStatus: FetchStatus;
    };
    fetchStatus: FetchStatus;
};

const initialState: CreateRepositoryFormStore = {
    error: '',
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
    if (event.type === 'create-repository-form/failed') {
        return {
            ...state,
            fetchStatus: FetchStatus.failed,
        };
    }

    if (event.type === 'create-repository-form/loading') {
        return {
            ...state,
            fetchStatus: FetchStatus.loading,
        };
    }

    if (event.type === 'create-repository-form/error') {
        return {
            ...state,
            error: event.data.error ?? '',
            fetchStatus: FetchStatus.error,
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

    if (event.type === 'create-repository-form/is-repository-name-free/failed') {
        return {
            ...state,
            repositoryNameStatus: {
                ...state.repositoryNameStatus,
                fetchStatus: FetchStatus.failed,
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
