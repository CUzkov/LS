import { Group, GroupType, IServerError } from 'types';
import { Dispatch, store } from 'store';
import { ajax } from 'ajax';

const GROUPS_BY_FILTERS_URL = '/api/group/filter';

type GetGroupsByFiltersQP = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    groupType?: GroupType;
};

type GetGroupsByFiltersRD = Group[];

export const getMapsByFiltersMaps = async (params: GetGroupsByFiltersQP) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'maps-list-page/maps-list/loading' });

    let response: GetGroupsByFiltersRD | undefined;

    try {
        response = await ajax.get<GetGroupsByFiltersRD, GetGroupsByFiltersQP>({
            url: GROUPS_BY_FILTERS_URL,
            queryParams: { ...params, groupType: GroupType.map },
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
