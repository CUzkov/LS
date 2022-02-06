import { FetchStatus, Map } from '../../types';

export interface IMainPageD {
    maps?: {
        data: Map[];
    };
}

export type MainPageEvents =
    | { type: 'main-page/maps/success'; data: IMainPageD }
    | { type: 'main-page/maps/loading' }
    | { type: 'main-page/maps/error' }
    | { type: 'main-page/clear' };

export type MainPageStore = {
    maps: {
        data: Map[];
        fetchStatus: FetchStatus;
    };
};

const initialState: MainPageStore = {
    maps: {
        data: [],
        fetchStatus: FetchStatus.loading,
    },
};

export const mainPageReducer = (state: MainPageStore = initialState, event: MainPageEvents): MainPageStore => {
    if (event.type === 'main-page/maps/success') {
        const result = { ...state };

        result.maps = {
            data: event.data.maps?.data ?? [],
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'main-page/maps/loading') {
        const result = { ...state };

        result.maps.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'main-page/maps/error') {
        const result = { ...state };

        result.maps.fetchStatus = FetchStatus.error;

        return result;
    }

    return state;
};
