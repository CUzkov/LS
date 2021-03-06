import { FetchStatus } from 'types';

export enum RepositoryNameStatus {
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
    | { type: 'create-repository-form/is-repository-name-free/not-checked' }
    | { type: 'create-repository-form/is-repository-name-free/status'; data: { isFree: boolean } };

export type CreateRepositoryFormStore = {
    repositoryNameStatus: {
        status: RepositoryNameStatus;
        fetchStatus: FetchStatus;
    };
    fetchStatus: FetchStatus;
};

const initialState: CreateRepositoryFormStore = {
    repositoryNameStatus: {
        status: RepositoryNameStatus.notChecked,
        fetchStatus: FetchStatus.none,
    },
    fetchStatus: FetchStatus.none,
};

export const createRepositoryFormReducer = (
    state: CreateRepositoryFormStore = initialState,
    event: CreateRepositoryFormEvents,
): CreateRepositoryFormStore => {
    const result = { ...state };

    if (event.type === 'create-repository-form/error') {
        result.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'create-repository-form/loading') {
        result.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'create-repository-form/success') {
        result.fetchStatus = FetchStatus.successed;
    }

    if (event.type === 'create-repository-form/is-repository-name-free/loading') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.loading;
        result.repositoryNameStatus.status = RepositoryNameStatus.notChecked;
    }

    if (event.type === 'create-repository-form/is-repository-name-free/error') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'create-repository-form/is-repository-name-free/status') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.successed;
        result.repositoryNameStatus.status = event.data.isFree ? RepositoryNameStatus.free : RepositoryNameStatus.busy;
    }

    if (event.type === 'create-repository-form/is-repository-name-free/not-checked') {
        result.repositoryNameStatus.status = RepositoryNameStatus.notChecked;
    }

    return result;
};
