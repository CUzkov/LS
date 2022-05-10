import { ajax } from '../ajax';
import { FullGroup, Group, GroupType, IServerError } from 'types';
import { Dispatch, store } from '../store';

const GET_FULL_GROUP_BY_ID = '/api/group/full';
const GROUPS_BY_FILTERS_URL = '/api/group/filter';

type GetFullGroupByIdQP = {
    groupId: number;
};

type GetFullGroupByIdRD = FullGroup;

export const getMapById = async (groupId: number) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-page/map/loading' });

    let response: GetFullGroupByIdRD | undefined;

    try {
        response = await ajax.get<GetFullGroupByIdRD, GetFullGroupByIdQP>({
            url: GET_FULL_GROUP_BY_ID,
            queryParams: { groupId },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-page/map/error' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'map-page/map/success',
        data: response,
    });
};

type GetGroupsByTitleQP = {
    title: string;
    groupType: GroupType;
    excludeGroupIds: number[];
    page: number;
};

type GetGroupsByTitleRD = Group[];

export const getMapsByTitle = async (title: string, excludeGroupIds: number[]) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'map-page/map/start-searching' });

    let response: GetGroupsByTitleRD | undefined;

    try {
        response = await ajax.get<GetGroupsByTitleRD, GetGroupsByTitleQP>({
            url: GROUPS_BY_FILTERS_URL,
            queryParams: { title, groupType: GroupType.map, excludeGroupIds, page: 1 },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'map-page/map/error-searching' });
        dispath({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispath({
        type: 'map-page/map/success-searching',
        data: response,
    });
};
