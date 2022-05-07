import { Group, GroupType, IServerError } from 'types';
import { Dispatch, store } from 'store';
import { ajax } from 'ajax';

const PAGE_SIZE = 10;

const GROUPS_BY_FILTERS_URL = '/api/group/filter';

type GetMapsByFiltersMapsProps = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    page: number;
};

type GetGroupsByFiltersQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    groupType?: GroupType;
    page: number;
    quantity: number;
};

type GetGroupsByFiltersRD = {
    groups: Group[];
    count: number;
};

export const getMapsByFiltersMaps = async (params: GetMapsByFiltersMapsProps) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'maps-list-page/maps-list/loading' });

    let response: GetGroupsByFiltersRD | undefined;

    try {
        response = await ajax.get<GetGroupsByFiltersRD, GetGroupsByFiltersQP>({
            url: GROUPS_BY_FILTERS_URL,
            queryParams: { ...params, groupType: GroupType.map, quantity: PAGE_SIZE },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'maps-list-page/maps-list/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'maps-list-page/maps-list/success',
        data: response,
    });
};
