import { FetchStatus, FullGroup, Group } from 'types';

export type MapPageEvents =
    | { type: 'map-page/map/success'; data: FullGroup }
    | { type: 'map-page/map/loading' }
    | { type: 'map-page/map/error' }
    | { type: 'map-page/map/start-searching' }
    | { type: 'map-page/map/error-searching' }
    | { type: 'map-page/map/success-searching'; data: Group[] };

export type MapPageStore = {
    map?: FullGroup;
    mapFetchStatus: FetchStatus;
    popupSearchingFetchStatus: FetchStatus;
    searchedMaps: Group[];
};

const initialState: MapPageStore = {
    map: undefined,
    mapFetchStatus: FetchStatus.none,
    popupSearchingFetchStatus: FetchStatus.none,
    searchedMaps: [],
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

    if (event.type === 'map-page/map/start-searching') {
        result.popupSearchingFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-page/map/error-searching') {
        result.popupSearchingFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-page/map/success-searching') {
        result.popupSearchingFetchStatus = FetchStatus.successed;
        result.searchedMaps = event.data;
    }

    return result;
};
