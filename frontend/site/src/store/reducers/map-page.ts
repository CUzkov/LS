import { FetchStatus, FullGroup } from '../../types';

export type MapPageEvents =
    | { type: 'map-page/map/success'; data: FullGroup }
    | { type: 'map-page/map/loading' }
    | { type: 'map-page/map/error' };

export type MapPageStore = {
    map?: FullGroup;
    mapFetchStatus: FetchStatus;
};

const initialState: MapPageStore = {
    map: undefined,
    mapFetchStatus: FetchStatus.none,
};

export const mapPageReducer = (state: MapPageStore = initialState, event: MapPageEvents): MapPageStore => {
    const result = { ...state };

    if (event.type === 'map-page/map/success') {
        result.map = event.data;
        result.mapFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'map-page/map/loading') {
        result.mapFetchStatus = FetchStatus.loading;
        result.map = undefined;
    }

    if (event.type === 'map-page/map/error') {
        result.mapFetchStatus = FetchStatus.error;
    }

    return result;
};
