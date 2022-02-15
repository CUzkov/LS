import { ajax, ContentType, AjaxType } from '../ajax';
import type { IServerError, Repository } from '../types';
import type { Dispatch } from '../store';

const REPOSITORIES_BY_FILTERS = '/api/repository/filter';

type IRepositoriesFilters = {
    is_rw: boolean;
    is_rwa: boolean;
    title: string;
    by_user: number;
};

export const getPageRepositoriesByFilters = async (dispath: Dispatch, filters: IRepositoriesFilters) => {
    dispath({ type: 'repositories-list-page/repositories-list/loading' });

    const response = await ajax<Repository[] | IServerError, IRepositoriesFilters>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: REPOSITORIES_BY_FILTERS,
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
        dispath({ type: 'logger/add-log', data: { type: 'error', title: response.error, description: '' } });
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
