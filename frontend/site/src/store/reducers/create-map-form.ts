import { FetchStatus, Group } from 'types';

export enum MapNameStatus {
    free,
    notChecked,
    busy,
}

export type CreateMapFormEvents =
    | { type: 'create-map-form/error' }
    | { type: 'create-map-form/success', data: Group }
    | { type: 'create-map-form/loading' }
    | { type: 'create-map-form/is-map-name-free/error' }
    | { type: 'create-map-form/is-map-name-free/loading' }
    | { type: 'create-map-form/is-map-name-free/not-checked' }
    | { type: 'create-map-form/is-map-name-free/status'; data: { isFree: boolean } };

export type CreateMapFormStore = {
    fetchStatus: FetchStatus;
    mapNameStatus: {
        status: MapNameStatus;
        fetchStatus: FetchStatus;
    };
};

const initialState: CreateMapFormStore = {
    fetchStatus: FetchStatus.none,
    mapNameStatus: {
        fetchStatus: FetchStatus.none,
        status: MapNameStatus.notChecked,
    },
};

export const createMapFormReducer = (
    state: CreateMapFormStore = initialState,
    event: CreateMapFormEvents,
): CreateMapFormStore => {
    const result = { ...state };

    if (event.type === 'create-map-form/error') {
        result.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'create-map-form/loading') {
        result.fetchStatus = FetchStatus.loading;
    }

    if (event.type === 'create-map-form/success') {
        result.fetchStatus = FetchStatus.successed;
    }

    if (event.type === 'create-map-form/is-map-name-free/loading') {
        result.mapNameStatus.fetchStatus = FetchStatus.loading;
        result.mapNameStatus.status = MapNameStatus.notChecked;
    }

    if (event.type === 'create-map-form/is-map-name-free/error') {
        result.mapNameStatus.fetchStatus = FetchStatus.error;
    }

    if (event.type === 'create-map-form/is-map-name-free/status') {
        result.mapNameStatus.fetchStatus = FetchStatus.successed;
        result.mapNameStatus.status = event.data.isFree ? MapNameStatus.free : MapNameStatus.busy;
    }

    if (event.type === 'create-map-form/is-map-name-free/not-checked') {
        result.mapNameStatus.status = MapNameStatus.notChecked;
    }

    return result;
};
