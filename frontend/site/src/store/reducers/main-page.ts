export interface IMainPageD {
    ff: number;
}

export type MainPageEvents =
    | { type: 'main-page/maps/success'; data: IMainPageD }
    | { type: 'main-page/maps/loading' }
    | { type: 'main-page/maps/error' }
    | { type: 'main-page/clear' };

export type MainPageStore = {
    ff: number;
};

const initialState: MainPageStore = {
    ff: 0,
};

export const mainPageReducer = (state: MainPageStore = initialState, event: MainPageEvents): MainPageStore => {
    if (event.type === 'main-page/maps/success') {
        const result = { ...state };

        return result;
    }

    if (event.type === 'main-page/maps/loading') {
        const result = { ...state };

        return result;
    }

    if (event.type === 'main-page/maps/error') {
        const result = { ...state };

        return result;
    }

    return state;
};
