import { FetchStatus, Repository, RWA, User } from '../../types';

export enum RepositoryNameStatus {
    free,
    notChecked,
    busy,
}

export type RepositorySettingsPageEvents =
    | { type: 'repository-settings-page/repository/success'; data: { repository: Repository; version: string } }
    | { type: 'repository-settings-page/repository/loading' }
    | { type: 'repository-settings-page/repository/error' }
    | { type: 'repository-settings-page/repository/version'; data: string }
    | { type: 'repository-settings-page/version/success'; data: string[] }
    | { type: 'repository-settings-page/version/loading' }
    | { type: 'repository-settings-page/version/error' }
    | { type: 'repository-settings-page/new-title/success'; data: string }
    | { type: 'repository-settings-page/new-title/loading' }
    | { type: 'repository-settings-page/new-title/error' }
    | { type: 'repository-settings-page/new-private/success'; data: boolean }
    | { type: 'repository-settings-page/new-private/loading' }
    | { type: 'repository-settings-page/new-private/error' }
    | { type: 'repository-settings-page/rw-rwa-users/success'; data: Array<User & { access: RWA }> }
    | { type: 'repository-settings-page/rw-rwa-users/loading' }
    | { type: 'repository-settings-page/rw-rwa-users/error' }
    | { type: 'repository-settings-page/searched-users/success'; data: User[] }
    | { type: 'repository-settings-page/searched-users/loading' }
    | { type: 'repository-settings-page/searched-users/error' }
    | { type: 'repository-settings-page/searched-users/clear' }
    | { type: 'repository-settings-page/change-access/add'; data: User & { access: RWA } }
    | { type: 'repository-settings-page/change-access/error'; data: User & { access: RWA } }
    | { type: 'repository-settings-page/change-access/success'; data: User & { access: RWA } }
    | { type: 'repository-settings-page/add-access/success' }
    | { type: 'repository-settings-page/add-access/loading' }
    | { type: 'repository-settings-page/add-access/error' }
    | { type: 'repository-settings-page/clear' }
    | { type: 'repository-settings-page/is-repository-name-free/error' }
    | { type: 'repository-settings-page/is-repository-name-free/loading' }
    | { type: 'repository-settings-page/is-repository-name-free/not-checked' }
    | { type: 'repository-settings-page/is-repository-name-free/status'; data: { isFree: boolean } };

export type RepositorySettingsPageStore = {
    repository?: Repository;
    repositoryVersion?: string;
    repositoryFetchStatus: FetchStatus;
    versions: string[];
    versionsFetchStatus: FetchStatus;
    newTitleFetchStatus: FetchStatus;
    newPrivateFetchStatus: FetchStatus;
    rwRwaUsers: {
        users: Array<User & { access: RWA }>;
        fetchStatus: FetchStatus;
    };
    searchedUsers: {
        fetchStatus: FetchStatus;
        users: User[];
    };
    changeAccessStatus: {
        fetchStatus: FetchStatus;
        userId: number;
    }[];
    addAccessFetchStatus: FetchStatus;
    repositoryNameStatus: {
        status: RepositoryNameStatus;
        fetchStatus: FetchStatus;
    };
};

const initialState: RepositorySettingsPageStore = {
    repository: undefined,
    repositoryFetchStatus: FetchStatus.none,
    versions: [],
    versionsFetchStatus: FetchStatus.none,
    newTitleFetchStatus: FetchStatus.none,
    newPrivateFetchStatus: FetchStatus.none,
    rwRwaUsers: {
        users: [],
        fetchStatus: FetchStatus.none,
    },
    searchedUsers: {
        fetchStatus: FetchStatus.none,
        users: [],
    },
    changeAccessStatus: [],
    addAccessFetchStatus: FetchStatus.none,
    repositoryNameStatus: {
        status: RepositoryNameStatus.notChecked,
        fetchStatus: FetchStatus.none,
    },
};

export const repositorySettingsPageReducer = (
    state: RepositorySettingsPageStore = initialState,
    event: RepositorySettingsPageEvents,
): RepositorySettingsPageStore => {
    const result = { ...state };

    if (event.type === 'repository-settings-page/repository/success') {
        result.repository = event.data.repository;
        result.repositoryVersion = event.data.version;
        result.repositoryFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'repository-settings-page/repository/loading') {
        result.repositoryFetchStatus = FetchStatus.loading;
        result.repository = undefined;
    }

    if (event.type === 'repository-settings-page/repository/error') {
        result.repositoryFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/version/loading') {
        result.versionsFetchStatus = FetchStatus.loading;
        result.versions = [];
    }

    if (event.type === 'repository-settings-page/version/error') {
        result.versionsFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/version/success') {
        result.versionsFetchStatus = FetchStatus.successed;
        result.versions = event.data;
    }

    if (event.type === 'repository-settings-page/clear') {
        result.repository = undefined;
        result.versions = [];
        result.repositoryVersion = undefined;
    }

    if (event.type === 'repository-settings-page/repository/version') {
        result.repositoryVersion = event.data;
    }

    if (event.type === 'repository-settings-page/new-title/success') {
        result.newTitleFetchStatus = FetchStatus.successed;

        if (result.repository) {
            result.repository.title = event.data;
        }
    }

    if (event.type === 'repository-settings-page/new-title/loading') {
        result.newTitleFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repository-settings-page/new-title/error') {
        result.newTitleFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/new-private/success') {
        result.newPrivateFetchStatus = FetchStatus.successed;

        if (result.repository) {
            result.repository.isPrivate = event.data;
        }
    }

    if (event.type === 'repository-settings-page/new-private/loading') {
        result.newPrivateFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repository-settings-page/new-private/error') {
        result.newPrivateFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/rw-rwa-users/success') {
        result.rwRwaUsers.fetchStatus = FetchStatus.successed;
        result.rwRwaUsers.users = event.data;
    }

    if (event.type === 'repository-settings-page/rw-rwa-users/loading') {
        result.rwRwaUsers.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repository-settings-page/rw-rwa-users/error') {
        result.rwRwaUsers.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/searched-users/success') {
        result.searchedUsers.fetchStatus = FetchStatus.successed;
        result.searchedUsers.users = event.data;
    }

    if (event.type === 'repository-settings-page/searched-users/loading') {
        result.searchedUsers.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repository-settings-page/searched-users/error') {
        result.searchedUsers.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/searched-users/clear') {
        result.searchedUsers.users = [];
        result.searchedUsers.fetchStatus = FetchStatus.none;
    }

    if (event.type === 'repository-settings-page/change-access/add') {
        result.changeAccessStatus = [
            ...result.changeAccessStatus,
            { userId: event.data.id, fetchStatus: FetchStatus.loading },
        ];
    }

    if (event.type === 'repository-settings-page/change-access/error') {
        result.changeAccessStatus = result.changeAccessStatus.map((accessRequest) =>
            accessRequest.userId === event.data.id
                ? { ...accessRequest, fetchStatus: FetchStatus.error }
                : accessRequest,
        );
    }

    if (event.type === 'repository-settings-page/change-access/success') {
        result.changeAccessStatus = result.changeAccessStatus.filter(
            (accessRequest) => accessRequest.userId !== event.data.id,
        );
        result.rwRwaUsers.users = result.rwRwaUsers.users.map((user) =>
            user.id === event.data.id ? { ...user, access: event.data.access } : user,
        );
    }

    if (event.type === 'repository-settings-page/add-access/success') {
        result.addAccessFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'repository-settings-page/add-access/loading') {
        result.addAccessFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'repository-settings-page/add-access/error') {
        result.addAccessFetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/is-repository-name-free/loading') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.loading;
        result.repositoryNameStatus.status = RepositoryNameStatus.notChecked;
    }

    if (event.type === 'repository-settings-page/is-repository-name-free/error') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'repository-settings-page/is-repository-name-free/status') {
        result.repositoryNameStatus.fetchStatus = FetchStatus.successed;
        result.repositoryNameStatus.status = event.data.isFree ? RepositoryNameStatus.free : RepositoryNameStatus.busy;
    }

    if (event.type === 'repository-settings-page/is-repository-name-free/not-checked') {
        result.repositoryNameStatus.status = RepositoryNameStatus.notChecked;
    }

    return result;
};
