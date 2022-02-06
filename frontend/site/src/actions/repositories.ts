import { ajax, ContentType, AjaxType } from '../ajax';

import type { IServerError, Empty } from '../types';
import { Dispatch } from '../store';

const CREATE_REPOSITORY_URL = '/api/user/create/repository';
const CHECK_IS_REPOSIROTY_NAME_FREE_URL = '/api/user/repository/free';

export interface INewRepositoryProps {
    title: string;
    is_private: boolean;
}

export interface ICheckIsRepositoryNameFreeProps {
    title: string;
}

interface ICheckIsRepositoryNameFreeResponseProps {
    is_free: boolean;
}

export const createRepository = async (dispath: Dispatch, props: INewRepositoryProps) => {
    dispath({ type: 'create-repository-form/loading' });

    const response = await ajax<Empty | IServerError, INewRepositoryProps>({
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
        ICheckIsRepositoryNameFreeResponseProps | IServerError,
        ICheckIsRepositoryNameFreeProps
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

    if ('is_free' in response) {
        dispath({ type: 'create-repository-form/is-repository-name-free/status', data: { isFree: response.is_free } });
    } else {
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
    }
};
