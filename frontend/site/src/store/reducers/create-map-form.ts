import { FetchStatus } from '../../types';

export type CreateMapFormEvents =
    | { type: 'create-map-form/failed' }
    | { type: 'create-map-form/success' }
    | { type: 'create-map-form/loading' };

export type CreateMapFormStore = {
    fetchStatus: FetchStatus;
};

const initialState: CreateMapFormStore = {
    fetchStatus: FetchStatus.none,
};

export const createMapFormReducer = (
    state: CreateMapFormStore = initialState,
    event: CreateMapFormEvents,
): CreateMapFormStore => {
    if (event.type === 'create-map-form/failed') {
        return {
            ...state,
            fetchStatus: FetchStatus.failed,
        };
    }

    if (event.type === 'create-map-form/loading') {
        return {
            ...state,
            fetchStatus: FetchStatus.loading,
        };
    }

    if (event.type === 'create-map-form/success') {
        return {
            ...state,
            fetchStatus: FetchStatus.successed,
        };
    }

    return state;
};
