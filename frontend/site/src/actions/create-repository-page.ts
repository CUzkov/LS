import { ajax } from '../ajax';
import { Empty, IServerError, Repository, RWA } from '../types';
import { Dispatch, store } from '../store';

const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';
const CREATE_REPOSITORY_URL = '/api/repository/create';

type CreateRepositoryD = {
    title: string;
    isPrivate: boolean;
};

type CreateRepositoryRD = {
    repository: {
        title: string;
        id: number;
        access: RWA;
    };
    version: string;
};

export const createRepository = async (props: CreateRepositoryD): Promise<Repository | void> => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-repository-form/loading' });

    let response: CreateRepositoryRD | undefined;

    try {
        response = await ajax.post<CreateRepositoryD, CreateRepositoryRD, Empty>({
            url: CREATE_REPOSITORY_URL,
            data: props,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'create-repository-form/error' });

        if (e?.name) {
            dispath({ type: 'logger/add-log', data: { type: 'error', title: e.name, description: e.description } });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'create-repository-form/success' });
    dispath({
        type: 'logger/add-log',
        data: { title: 'Репозиторий создан', description: 'Успешное создание нового репозитория', type: 'success' },
    });

    return response.repository;
};

type CheckIsRepositoryNameFreeD = {
    title: string;
};

type CheckIsRepositoryNameFreeRD = {
    isFree: boolean;
};

export const checkIsRepositoryNameFree = async (props: { title: string }) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-repository-form/is-repository-name-free/loading' });

    let response: CheckIsRepositoryNameFreeRD | undefined;

    try {
        response = await ajax.post<CheckIsRepositoryNameFreeD, CheckIsRepositoryNameFreeRD, Empty>({
            url: CHECK_IS_REPOSIROTY_NAME_FREE_URL,
            data: props,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'create-repository-form/is-repository-name-free/error' });

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

    dispath({ type: 'create-repository-form/is-repository-name-free/status', data: { isFree: response.isFree } });
};

export const setRepositoryNameNotChecked = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-repository-form/is-repository-name-free/not-checked' });
};
