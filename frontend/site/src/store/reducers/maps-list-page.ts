import { FetchStatus, Group } from 'types';

export type MapsListPageEvents =
    | { type: 'maps-list-page/maps-list/success'; data: Group[] }
    | { type: 'maps-list-page/maps-list/loading' }
    | { type: 'maps-list-page/maps-list/error' }
    | { type: 'maps-list-page/maps-list/clear' };

export type MapsListPageStore = {
    groups: Group[];
    groupsFetchStatus: FetchStatus;
};

const initialState: MapsListPageStore = {
    groups: [],
    groupsFetchStatus: FetchStatus.none,
};

export const mapsListPageReducer = (
    state: MapsListPageStore = initialState,
    event: MapsListPageEvents,
): MapsListPageStore => {
    const result = { ...state };

    if (event.type === 'maps-list-page/maps-list/success') {
        result.groups = event.data;
        result.groupsFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'maps-list-page/maps-list/loading') {
        result.groupsFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'maps-list-page/maps-list/error') {
        result.groupsFetchStatus = FetchStatus.error;
    }

    return result;
};
