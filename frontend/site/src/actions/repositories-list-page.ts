import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository';

import { ajax, ContentType, AjaxType } from '../ajax';
import { IServerError } from '../types';
import { Dispatch } from '../store';
import { REPOSITORIES_BY_FILTERS_URL } from './urls';

export const getPageRepositoriesByFilters = async (dispath: Dispatch, filters: RepositoriesByFilterQP) => {
    dispath({ type: 'repositories-list-page/repositories-list/loading' });

    const response = await ajax<RepositoriesByFilterRD | IServerError, RepositoriesByFilterQP>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: REPOSITORIES_BY_FILTERS_URL,
        queryParams: filters,
    }).catch(() => {
        dispath({ type: 'repositories-list-page/repositories-list/failed' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    });

    if (!response) {
        return;
    }

    if ('error' in response) {
        dispath({ type: 'repositories-list-page/repositories-list/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: response.error, description: response.description },
        });
    } else {
        dispath({
            type: 'repositories-list-page/repositories-list/success',
            data: {
                repositories: {
                    data: response,
                },
            },
        });
    }
};
