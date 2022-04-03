import { AxiosError } from 'axios';

import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ajax2, ContentType, AjaxType } from '../ajax';
import { Empty, IServerError, Repository } from '../types';
import { Dispatch, store } from '../store';

const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';
const CREATE_REPOSITORY_URL = '/api/repository/create';

export const createRepository = async (props: CreateRepositoryD): Promise<Repository | void> => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-repository-form/loading' });

    let response: CreateRepositoryRD;

    try {
        response = await ajax2.post<CreateRepositoryD, CreateRepositoryRD, Empty>({
            url: CREATE_REPOSITORY_URL,
            data: props,
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        dispath({ type: 'create-repository-form/error' });

        if (e?.error) {
            dispath({ type: 'logger/add-log', data: { type: 'error', title: e.error, description: e.description } });
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

    return response;
};

export const checkIsRepositoryNameFree = async (props: { title: string }) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-repository-form/is-repository-name-free/loading' });

    let response: CheckIsRepositoryNameFreeRD;

    try {
        response = await ajax2.post<CheckIsRepositoryNameFreeD, CheckIsRepositoryNameFreeRD, Empty>({
            url: CHECK_IS_REPOSIROTY_NAME_FREE_URL,
            data: props,
        });
    } catch (error) {
        const e = (error as AxiosError).response?.data as IServerError;

        dispath({ type: 'create-repository-form/is-repository-name-free/error' });

        if (e?.error) {
            dispath({
                type: 'logger/add-log',
                data: { title: e.error, description: e.description, type: 'error' },
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
