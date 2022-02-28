import { RepositoryByIdQP, RepositoryByIdRD } from '@api-types/repository/get-repository-by-id';

import { ajax, ContentType, AjaxType } from '../ajax';
import { IServerError } from '../types';
import { Dispatch } from '../store';
import { REPOSITORY_BY_ID_URL } from './urls';

export const getPageRepositoriesById = async (dispath: Dispatch, queryParams: RepositoryByIdQP) => {
    let isExit = false;

    dispath({ type: 'repository-page/repository/loading' });
    dispath({ type: 'repository-page/files/loading' });

    const error = () => {
        dispath({ type: 'repository-page/repository/error' });
        dispath({ type: 'repository-page/files/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        isExit = true;
    };

    const response = await ajax<RepositoryByIdRD | IServerError, RepositoryByIdQP>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: REPOSITORY_BY_ID_URL,
        queryParams,
    }).catch(() => error());

    if (isExit) return;
    if (!response) return error();

    if ('error' in response) {
        dispath({ type: 'repository-page/repository/error' });
        dispath({ type: 'repository-page/files/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: response.error, description: response.description },
        });
    } else {
        dispath({
            type: 'repository-page/repository/success',
            data: {
                repository: {
                    data: response,
                },
            },
        });
        dispath({
            type: 'repository-page/files/success',
            data: {
                files: {
                    data: response.rootFiles,
                },
            },
        });
    }
};
