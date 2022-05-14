import { ajax } from '../ajax';
import { IServerError, RWA } from '../types';
import { Dispatch, store } from '../store';

const PAGE_SIZE = 10;

const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';

export type RepositoriesByFilterQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
    quantity: number;
};

type RepositoriesByFilterRD = {
    repositories: {
        repository: {
            title: string;
            id: number;
            access: RWA;
        };
        version: string;
    }[];
    count: number;
};

type RepositoriesByFilterProps = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
};

export const getPageRepositoriesByFilters = async (filters: RepositoriesByFilterProps) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'repositories-list-page/repositories-list/loading' });

    let response: RepositoriesByFilterRD | undefined;

    try {
        response = await ajax.get<RepositoriesByFilterRD, RepositoriesByFilterQP>({
            url: REPOSITORIES_BY_FILTERS_URL,
            queryParams: { ...filters, quantity: PAGE_SIZE },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'repositories-list-page/repositories-list/error' });

        if (e?.name) {
            dispath({ type: 'logger/add-log', data: { type: 'error', title: e.name, description: e.description } });
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
