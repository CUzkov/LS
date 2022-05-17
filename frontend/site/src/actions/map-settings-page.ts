import { ajax } from '../ajax';
import { Empty, FullGroup, GroupType, IServerError, RWA, User } from 'types';
import { Dispatch, store } from '../store';

const GET_FULL_GROUP_BY_ID = '/api/group/full';
const CHECK_IS_GROUP_NAME_FREE_URL = '/api/group/free';
const CHANGE_GROUP = '/api/group/change';
const GET_USERS_WITH_GROUP_ACCESS = '/api/group/get-access-users';
const CHANGE_GROUP_ACCESS = '/api/group/change/access';
const GET_USERS_BY_FILTERS = '/api/user/get-by-filters';

type GetFullGroupByIdQP = {
    groupId: number;
};

type GetFullGroupByIdRD = FullGroup;

export const getMapById = async (groupId: number) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-settings-page/map/loading' });

    let response: GetFullGroupByIdRD | undefined;

    try {
        response = await ajax.get<GetFullGroupByIdRD, GetFullGroupByIdQP>({
            url: GET_FULL_GROUP_BY_ID,
            queryParams: { groupId },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/map/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'map-settings-page/map/success',
        data: response,
    });
};

export const clearMapSettingsPage = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-settings-page/clear' });
};

type ChangeMapD = {
    newTitle: string;
    newPrivate: boolean;
    groupId: number;
};

export const changeGroup = async (changes: { newTitle?: string; newPrivate?: boolean }) => {
    const dispath: Dispatch = store.dispatch;

    const {
        mapSettingsPage: { map },
    } = store.getState();

    if (!map) {
        return;
    }

    if (changes.newTitle) {
        dispath({ type: 'map-settings-page/new-title/loading' });
    }

    if (changes.newPrivate !== undefined) {
        dispath({ type: 'map-settings-page/new-private/loading' });
    }

    try {
        await ajax.post<ChangeMapD, Empty, Empty>({
            url: CHANGE_GROUP,
            data: {
                newTitle: changes.newTitle ? changes.newTitle : map.title,
                newPrivate: changes.newPrivate !== undefined ? changes.newPrivate : map.isPrivate,
                groupId: map.id,
            },
        });
    } catch (error) {
        const e = error as IServerError;

        if (changes.newTitle) {
            dispath({ type: 'map-settings-page/new-title/error' });
        }

        if (changes.newPrivate !== undefined) {
            dispath({ type: 'map-settings-page/new-private/error' });
        }

        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    if (changes.newTitle) {
        dispath({ type: 'map-settings-page/new-title/success', data: changes.newTitle });
        dispath({
            type: 'logger/add-log',
            data: { type: 'success', title: 'Успешно!', description: 'Название карты успешно изменено' },
        });
    }

    if (changes.newPrivate !== undefined) {
        dispath({ type: 'map-settings-page/new-private/success', data: changes.newPrivate });
        dispath({
            type: 'logger/add-log',
            data: { type: 'success', title: 'Успешно!', description: 'Приватность карты успешно изменена' },
        });
    }
};

type GetUsersWithMapAccessQP = {
    groupId: number;
};

type GetUsersWithGroupAccessRD = Array<User & { access: RWA }>;

export const getUsersWithMapAccess = async () => {
    const dispath: Dispatch = store.dispatch;

    const {
        mapSettingsPage: { map },
        user,
    } = store.getState();

    if (!map) {
        return;
    }

    //@FIXME изменить названия rw-rwa-users -> access-users или похожее (и в настройках репозитория тоже)
    dispath({ type: 'map-settings-page/rw-rwa-users/loading' });

    let response: GetUsersWithGroupAccessRD | undefined;

    try {
        response = await ajax.get<GetUsersWithGroupAccessRD, GetUsersWithMapAccessQP>({
            url: GET_USERS_WITH_GROUP_ACCESS,
            queryParams: { groupId: map.id },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/rw-rwa-users/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'map-settings-page/rw-rwa-users/success',
        //@FIXME запретить на беке отбирать у себя доступы
        data: response.filter((currUser) => currUser.id !== map?.userId && currUser.id !== user.userId),
    });
};

type GetUsersByFiltersQP = {
    page: number;
    quantity: number;
    username?: string;
    excludeUserIds?: number[];
};

type GetUsersByFiltersRD = {
    users: User[];
    count: number;
};

//@FIXME убрать дикое копирование
export const getUsersByFilters = async (username: string, excludeUserIds: number[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-settings-page/searched-users/loading' });

    let response: GetUsersByFiltersRD | undefined;

    try {
        response = await ajax.get<GetUsersByFiltersRD, GetUsersByFiltersQP>({
            url: GET_USERS_BY_FILTERS,
            queryParams: { page: 1, quantity: 5, username, excludeUserIds },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/searched-users/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'map-settings-page/searched-users/success',
        data: response.users,
    });
};

export const clearSearchedUsers = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-settings-page/searched-users/clear' });
};

type AddMapAccessD = {
    groupId: number;
    userIds: number[];
    access: RWA;
};

export const addMapAccess = async (access: RWA, users: User[]) => {
    const dispath: Dispatch = store.dispatch;

    const {
        mapSettingsPage: { map },
    } = store.getState();

    if (!map) {
        return;
    }

    dispath({ type: 'map-settings-page/add-access/loading' });

    try {
        await ajax.post<AddMapAccessD, Empty, Empty>({
            url: CHANGE_GROUP_ACCESS,
            data: { access, groupId: map.id, userIds: users.map((user) => user.id) },
        });
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/add-access/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({ type: 'map-settings-page/add-access/success' });

    getUsersWithMapAccess();
};

type ChangeMapAccessD = {
    groupId: number;
    userIds: number[];
    access: RWA;
};

export const changeMapAccess = async (access: RWA, user: User): Promise<boolean> => {
    const dispath: Dispatch = store.dispatch;

    const {
        mapSettingsPage: { map },
    } = store.getState();

    if (!map) {
        return false;
    }

    dispath({ type: 'map-settings-page/change-access/add', data: { ...user, access } });

    try {
        await ajax.post<ChangeMapAccessD, Empty, Empty>({
            url: CHANGE_GROUP_ACCESS,
            data: { access, groupId: map.id, userIds: [user.id] },
        });
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/change-access/error', data: { ...user, access } });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return false;
    }

    dispath({ type: 'map-settings-page/change-access/success', data: { ...user, access } });

    return true;
};

type CheckIsMapNameFreeD = {
    title: string;
    groupType: GroupType;
};

type CheckIsMapNameFreeRD = {
    isFree: boolean;
};

//@FIXME убрать дикое копирование
export const checkIsMapNameFree = async (props: { title: string }) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-settings-page/is-map-name-free/loading' });

    let response: CheckIsMapNameFreeRD | undefined;

    try {
        response = await ajax.post<CheckIsMapNameFreeD, CheckIsMapNameFreeRD, Empty>({
            url: CHECK_IS_GROUP_NAME_FREE_URL,
            data: { ...props, groupType: GroupType.map },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-settings-page/is-map-name-free/error' });

        if (e?.name) {
            dispath({
                type: 'logger/add-log',
                data: { title: e.name, description: e.description, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'map-settings-page/is-map-name-free/status', data: { isFree: response.isFree } });
};
