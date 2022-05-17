import { FetchStatus, FullGroup, RWA, User } from '../../types';

export enum MapNameStatus {
    free,
    notChecked,
    busy,
}

export type MapSettingsPageEvents =
    | { type: 'map-settings-page/map/success'; data: FullGroup }
    | { type: 'map-settings-page/map/loading' }
    | { type: 'map-settings-page/map/error' }
    | { type: 'map-settings-page/new-title/success'; data: string }
    | { type: 'map-settings-page/new-title/loading' }
    | { type: 'map-settings-page/new-title/error' }
    | { type: 'map-settings-page/new-private/success'; data: boolean }
    | { type: 'map-settings-page/new-private/loading' }
    | { type: 'map-settings-page/new-private/error' }
    | { type: 'map-settings-page/rw-rwa-users/success'; data: Array<User & { access: RWA }> }
    | { type: 'map-settings-page/rw-rwa-users/loading' }
    | { type: 'map-settings-page/rw-rwa-users/error' }
    | { type: 'map-settings-page/searched-users/success'; data: User[] }
    | { type: 'map-settings-page/searched-users/loading' }
    | { type: 'map-settings-page/searched-users/error' }
    | { type: 'map-settings-page/searched-users/clear' }
    | { type: 'map-settings-page/change-access/add'; data: User & { access: RWA } }
    | { type: 'map-settings-page/change-access/error'; data: User & { access: RWA } }
    | { type: 'map-settings-page/change-access/success'; data: User & { access: RWA } }
    | { type: 'map-settings-page/add-access/success' }
    | { type: 'map-settings-page/add-access/loading' }
    | { type: 'map-settings-page/add-access/error' }
    | { type: 'map-settings-page/clear' }
    | { type: 'map-settings-page/is-map-name-free/error' }
    | { type: 'map-settings-page/is-map-name-free/loading' }
    | { type: 'map-settings-page/is-map-name-free/not-checked' }
    | { type: 'map-settings-page/is-map-name-free/status'; data: { isFree: boolean } };

export type MapSettingsPageStore = {
    map?: FullGroup;
    mapFetchStatus: FetchStatus;
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
    mapNameStatus: {
        status: MapNameStatus;
        fetchStatus: FetchStatus;
    };
};

const initialState: MapSettingsPageStore = {
    map: undefined,
    mapFetchStatus: FetchStatus.none,
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
    mapNameStatus: {
        status: MapNameStatus.notChecked,
        fetchStatus: FetchStatus.none,
    },
};

export const mapSettingsPageReducer = (
    state: MapSettingsPageStore = initialState,
    event: MapSettingsPageEvents,
): MapSettingsPageStore => {
    const result = { ...state };

    if (event.type === 'map-settings-page/map/success') {
        result.map = event.data;
        result.mapFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'map-settings-page/map/loading') {
        result.mapFetchStatus = FetchStatus.loading;
        result.map = undefined;
    }

    if (event.type === 'map-settings-page/map/error') {
        result.mapFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/clear') {
        result.map = undefined;
    }

    if (event.type === 'map-settings-page/new-title/success') {
        result.newTitleFetchStatus = FetchStatus.successed;

        if (result.map) {
            result.map.title = event.data;
        }
    }

    if (event.type === 'map-settings-page/new-title/loading') {
        result.newTitleFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-settings-page/new-title/error') {
        result.newTitleFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/new-private/success') {
        result.newPrivateFetchStatus = FetchStatus.successed;

        if (result.map) {
            result.map.isPrivate = event.data;
        }
    }

    if (event.type === 'map-settings-page/new-private/loading') {
        result.newPrivateFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-settings-page/new-private/error') {
        result.newPrivateFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/rw-rwa-users/success') {
        result.rwRwaUsers.fetchStatus = FetchStatus.successed;
        result.rwRwaUsers.users = event.data;
    }

    if (event.type === 'map-settings-page/rw-rwa-users/loading') {
        result.rwRwaUsers.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-settings-page/rw-rwa-users/error') {
        result.rwRwaUsers.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/searched-users/success') {
        result.searchedUsers.fetchStatus = FetchStatus.successed;
        result.searchedUsers.users = event.data;
    }

    if (event.type === 'map-settings-page/searched-users/loading') {
        result.searchedUsers.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-settings-page/searched-users/error') {
        result.searchedUsers.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/searched-users/clear') {
        result.searchedUsers.users = [];
        result.searchedUsers.fetchStatus = FetchStatus.none;
    }

    if (event.type === 'map-settings-page/change-access/add') {
        result.changeAccessStatus = [
            ...result.changeAccessStatus,
            { userId: event.data.id, fetchStatus: FetchStatus.loading },
        ];
    }

    if (event.type === 'map-settings-page/change-access/error') {
        result.changeAccessStatus = result.changeAccessStatus.map((accessRequest) =>
            accessRequest.userId === event.data.id
                ? { ...accessRequest, fetchStatus: FetchStatus.error }
                : accessRequest,
        );
    }

    if (event.type === 'map-settings-page/change-access/success') {
        result.changeAccessStatus = result.changeAccessStatus.filter(
            (accessRequest) => accessRequest.userId !== event.data.id,
        );
        result.rwRwaUsers.users = result.rwRwaUsers.users.map((user) =>
            user.id === event.data.id ? { ...user, access: event.data.access } : user,
        );
    }

    if (event.type === 'map-settings-page/add-access/success') {
        result.addAccessFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'map-settings-page/add-access/loading') {
        result.addAccessFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-settings-page/add-access/error') {
        result.addAccessFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/is-map-name-free/loading') {
        result.mapNameStatus.fetchStatus = FetchStatus.loading;
        result.mapNameStatus.status = MapNameStatus.notChecked;
    }

    if (event.type === 'map-settings-page/is-map-name-free/error') {
        result.mapNameStatus.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-settings-page/is-map-name-free/status') {
        result.mapNameStatus.fetchStatus = FetchStatus.successed;
        result.mapNameStatus.status = event.data.isFree ? MapNameStatus.free : MapNameStatus.busy;
    }

    if (event.type === 'map-settings-page/is-map-name-free/not-checked') {
        result.mapNameStatus.status = MapNameStatus.notChecked;
    }

    return result;
};
