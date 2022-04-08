import { RepositoriesByFilterQP, RepositoriesByFilterRD } from '@api-types/repository/repositories-by-filter';

import { ajax } from '../ajax';
import { IServerError } from '../types';
import { Dispatch, store } from '../store';

const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

export const getPageRepositoriesByFilters = async (filters: RepositoriesByFilterQP) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repositories-list-page/repositories-list/loading' });

    let response: RepositoriesByFilterRD | undefined;

    try {
        response = await ajax.get<RepositoriesByFilterRD, RepositoriesByFilterQP>({
            url: REPOSITORIES_BY_FILTERS_URL,
            queryParams: filters,
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repositories-list-page/repositories-list/error' });

        if (e?.error) {
            dispath({ type: 'logger/add-log', data: { type: 'error', title: e.error, description: e.description } });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({
        type: 'repositories-list-page/repositories-list/success',
        data: response,
    });
};
