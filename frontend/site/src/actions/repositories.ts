import { CreateRepositoryD, CreateRepositoryRD } from '@api-types/repository/create-repository';
import {
    CheckIsRepositoryNameFreeD,
    CheckIsRepositoryNameFreeRD,
} from '@api-types/repository/check-is-repository-name-free';

import { ajax, ContentType, AjaxType } from '../ajax';
import { IServerError, Repository } from '../types';
import { Dispatch } from '../store';

const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/repository/free';
const CREATE_REPOSITORY_URL = '/api/repository/create';

export const createRepository = async (dispath: Dispatch, props: CreateRepositoryD): Promise<Repository | void> => {
    dispath({ type: 'create-repository-form/loading' });

    let response: CreateRepositoryRD | IServerError;

    try {
        response = await ajax<CreateRepositoryRD | IServerError, CreateRepositoryD>({
            type: AjaxType.post,
            contentType: ContentType.JSON,
            url: CREATE_REPOSITORY_URL,
            data: props,
        });
    } catch (error) {
        dispath({ type: 'create-repository-form/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        dispath({ type: 'create-repository-form/error' });
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'create-repository-form/success' });
    dispath({
        type: 'logger/add-log',
        data: { title: 'Репозиторий создан', description: 'Успешное создание нового репозитория', type: 'success' },
    });

    return response;
};

export const checkIsRepositoryNameFree = async (dispath: Dispatch, props: { title: string }) => {
    dispath({ type: 'create-repository-form/is-repository-name-free/loading' });

    let response: CheckIsRepositoryNameFreeRD | IServerError;

    try {
        response = await ajax<CheckIsRepositoryNameFreeRD | IServerError, CheckIsRepositoryNameFreeD>({
            type: AjaxType.post,
            contentType: ContentType.JSON,
            url: CHECK_IS_REPOSIROTY_NAME_FREE_URL,
            data: props,
        });
    } catch (error) {
        dispath({ type: 'create-repository-form/is-repository-name-free/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        dispath({ type: 'create-repository-form/is-repository-name-free/error' });
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
        return;
    }

    dispath({ type: 'create-repository-form/is-repository-name-free/status', data: { isFree: response.isFree } });
};
