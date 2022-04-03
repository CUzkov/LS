import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';

import { ajax, ContentType, AjaxType } from '../ajax';
import { IServerError } from '../types';
import { Dispatch } from '../store';

const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

export const getPageRepositoriesByFilters = async (dispath: Dispatch, filters: RepositoriesByFilterQP) => {
    dispath({ type: 'repositories-list-page/repositories-list/loading' });

    let response: RepositoriesByFilterRD | IServerError;

    try {
        response = await ajax<RepositoriesByFilterRD | IServerError, RepositoriesByFilterQP>({
            type: AjaxType.get,
            contentType: ContentType.JSON,
            url: REPOSITORIES_BY_FILTERS_URL,
            queryParams: filters,
        });
    } catch (error) {
        dispath({ type: 'repositories-list-page/repositories-list/error' });
        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    if ('error' in response) {
        dispath({ type: 'repositories-list-page/repositories-list/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: response.error, description: response.description },
        });
        return;
    }

    dispath({
        type: 'repositories-list-page/repositories-list/success',
        data: {
            repositories: {
                data: response,
            },
        },
    });
};
