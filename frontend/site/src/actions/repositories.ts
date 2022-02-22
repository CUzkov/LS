import {CreateRepositoryD, CheckIsRepositoryNameFreeD, CheckIsRepositoryNameFreeRD, CreateRepositoryRD} from '@api-types/repository'

import { ajax, ContentType, AjaxType } from '../ajax';
import { IServerError } from '../types';
import { Dispatch } from '../store';
import {CREATE_REPOSITORY_URL, CHECK_IS_REPOSIROTY_NAME_FREE_URL} from './urls'

export const createRepository = async (dispath: Dispatch, props: CreateRepositoryD) => {
    dispath({ type: 'create-repository-form/loading' });

    const response = await ajax<CreateRepositoryRD | IServerError, CreateRepositoryD>({
        type: AjaxType.post,
        contentType: ContentType.JSON,
        url: CREATE_REPOSITORY_URL,
        data: props,
    }).catch(() => {
        dispath({ type: 'create-repository-form/failed' });
        return;
    });

    if (!response) {
        return;
    }

    if ('title' in response) {
        dispath({ type: 'create-repository-form/success' });
        dispath({
            type: 'logger/add-log',
            data: { title: 'Репозиторий создан', description: 'Успешное создание нового репозитория', type: 'success' },
        });
    } else {
        dispath({ type: 'create-repository-form/error', data: {} });
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
    }
};

export const checkIsRepositoryNameFree = async (dispath: Dispatch, props: { title: string }) => {
    dispath({ type: 'create-repository-form/is-repository-name-free/loading' });

    const response = await ajax<
        CheckIsRepositoryNameFreeRD | IServerError,
        CheckIsRepositoryNameFreeD
    >({
        type: AjaxType.post,
        contentType: ContentType.JSON,
        url: CHECK_IS_REPOSIROTY_NAME_FREE_URL,
        data: props,
    }).catch(() => {
        dispath({ type: 'create-repository-form/is-repository-name-free/failed' });
        return;
    });

    if (!response) {
        dispath({ type: 'create-repository-form/is-repository-name-free/failed' });
        return;
    }

    if ('isFree' in response) {
        dispath({ type: 'create-repository-form/is-repository-name-free/status', data: { isFree: response.isFree } });
    } else {
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
    }
};
