import { FetchStatus, Map } from '../../types';

export interface IMapsListPageD {
    maps?: {
        data: Map[];
    };
}

export type MapsListPageEvents =
    | { type: 'maps-list-page/maps-list/success'; data: IMapsListPageD }
    | { type: 'maps-list-page/maps-list/loading' }
    | { type: 'maps-list-page/maps-list/error' }
    | { type: 'maps-list-page/maps-list/clear' };

export type MapsListPageStore = {
    maps: {
        data: Map[];
        fetchStatus: FetchStatus;
    };
};

const initialState: MapsListPageStore = {
    maps: {
        data: [],
        fetchStatus: FetchStatus.loading,
    },
};

export const mapsListPageReducer = (
    state: MapsListPageStore = initialState,
    event: MapsListPageEvents,
): MapsListPageStore => {
    if (event.type === 'maps-list-page/maps-list/success') {
        const result = { ...state };

        result.maps = {
            data: event.data.maps?.data ?? [],
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'maps-list-page/maps-list/loading') {
        const result = { ...state };

        result.maps.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'maps-list-page/maps-list/error') {
        const result = { ...state };

        result.maps.fetchStatus = FetchStatus.error;

        return result;
    }

    return state;
};
