import { ajax } from '../ajax';
import { Empty, IServerError, Repository, RWA, User } from 'types';
import { Dispatch, store } from '../store';

const REPOSITORY_BY_ID_URL = '/api/repository/id';
const CHANGE_REPOSITORY = '/api/repository/change';
const GET_USERS_WITH_REPOSITORY_RW_RWA_ACCESS = '/api/repository/get-rw-rwa-users';
const GET_USERS_BY_FILTERS = '/api/user/get-by-filters';
const CHANGE_REPOSITORY_ACCESS = '/api/repository/change/access';

type GetRepositoryByIdQP = {
    id: number;
    version?: string;
};

type GetRepositoryByIdRD = {
    repository: Repository;
    version: string;
};

export const getRepositoryById = async (id: number, version?: string) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-settings-page/repository/loading' });

    let response: GetRepositoryByIdRD | undefined;

    try {
        response = await ajax.get<GetRepositoryByIdRD, GetRepositoryByIdQP>({
            url: REPOSITORY_BY_ID_URL,
            queryParams: { id, version },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-settings-page/repository/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'repository-settings-page/repository/success',
        data: response,
    });
};

export const clearRepositorySettingsPage = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-settings-page/clear' });
};

type ChangeRepositoryD = {
    newTitle: string;
    repositoryId: number;
};

export const changeRepository = async (newTitle: string) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositorySettingsPage: { repository },
    } = store.getState();

    dispath({ type: 'repository-settings-page/new-title/loading' });

    try {
        await ajax.post<ChangeRepositoryD, Empty, Empty>({
            url: CHANGE_REPOSITORY,
            data: {
                newTitle,
                repositoryId: repository?.id ?? -1,
            },
        });
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-settings-page/new-title/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({ type: 'repository-settings-page/new-title/success', data: newTitle });
    dispath({
        type: 'logger/add-log',
        data: { type: 'success', title: 'Успешно!', description: 'Название репозитория успешно изменено' },
    });
};

type GetUsersWithRepositoryRWrwaAccessQP = {
    repositoryId: number;
};

type GetUsersWithRepositoryRWrwaAccessRD = Array<User & { access: RWA }>;

export const getUsersWithRepositoryRWrwaAccess = async () => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositorySettingsPage: { repository },
        user,
    } = store.getState();

    dispath({ type: 'repository-settings-page/rw-rwa-users/loading' });

    let response: GetUsersWithRepositoryRWrwaAccessRD | undefined;

    try {
        response = await ajax.get<GetUsersWithRepositoryRWrwaAccessRD, GetUsersWithRepositoryRWrwaAccessQP>({
            url: GET_USERS_WITH_REPOSITORY_RW_RWA_ACCESS,
            queryParams: { repositoryId: repository?.id ?? -1 },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-settings-page/rw-rwa-users/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'repository-settings-page/rw-rwa-users/success',
        //@FIXME запретить на беке отбирать у себя доступы
        data: response.filter((currUser) => currUser.id !== repository?.userId && currUser.id !== user.userId),
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

export const getUsersByFilters = async (username: string, excludeUserIds: number[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-settings-page/searched-users/loading' });

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

        dispath({ type: 'repository-settings-page/searched-users/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'repository-settings-page/searched-users/success',
        data: response.users,
    });
};

export const clearSearchedUsers = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repository-settings-page/searched-users/clear' });
};

type AddRepositoryAccessD = {
    repositoryId: number;
    userIds: number[];
    access: RWA;
};

export const addRepositoryAccess = async (access: RWA, users: User[]) => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositorySettingsPage: { repository },
    } = store.getState();

    dispath({ type: 'repository-settings-page/add-access/loading' });

    try {
        await ajax.post<AddRepositoryAccessD, Empty, Empty>({
            url: CHANGE_REPOSITORY_ACCESS,
            data: { access, repositoryId: repository?.id ?? -1, userIds: users.map((user) => user.id) },
        });
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-settings-page/add-access/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({ type: 'repository-settings-page/add-access/success' });

    getUsersWithRepositoryRWrwaAccess();
};

type ChangeRepositoryAccessD = {
    repositoryId: number;
    userIds: number[];
    access: RWA;
};

export const changeRepositoryAccess = async (access: RWA, user: User): Promise<boolean> => {
    const dispath: Dispatch = store.dispatch;

    const {
        repositorySettingsPage: { repository },
    } = store.getState();

    dispath({ type: 'repository-settings-page/change-access/add', data: { ...user, access } });

    try {
        await ajax.post<ChangeRepositoryAccessD, Empty, Empty>({
            url: CHANGE_REPOSITORY_ACCESS,
            data: { access, repositoryId: repository?.id ?? -1, userIds: [user.id] },
        });
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repository-settings-page/change-access/error', data: { ...user, access } });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return false;
    }

    dispath({ type: 'repository-settings-page/change-access/success', data: { ...user, access } });

    return true;
};
