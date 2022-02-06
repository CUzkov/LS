import { FetchStatus } from '../../types';

export type CreateMapFormErrors = '';

export interface ICreateMapFormD {
    error?: CreateMapFormErrors;
}

export type CreateMapFormEvents =
    | { type: 'create-map-form/failed' }
    | { type: 'create-map-form/success' }
    | { type: 'create-map-form/loading' }
    | { type: 'create-map-form/error'; data: ICreateMapFormD };

export type CreateMapFormStore = {
    error: CreateMapFormErrors;
    fetchStatus: FetchStatus;
};

const initialState: CreateMapFormStore = {
    error: '',
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

    if (event.type === 'create-map-form/error') {
        return {
            error: event.data.error ?? '',
            fetchStatus: FetchStatus.error,
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
