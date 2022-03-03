import { FetchStatus } from '../../types';

export interface IUserStoreD {
    userId?: number;
    username?: string;
    email?: string;
    isAdmin?: boolean;
}

export type UserEvents =
    | { type: 'user/error' }
    | { type: 'user/success'; data: IUserStoreD }
    | { type: 'user/loading' }
    | { type: 'user/none' };

export type UserStore = {
    userId: number;
    username: string;
    email: string;
    isAdmin: boolean;
    fetchStatus: FetchStatus;
};

const initialState: UserStore = {
    userId: -1,
    username: '',
    email: '',
    isAdmin: false,
    fetchStatus: FetchStatus.loading,
};

export const userReducer = (state: UserStore = initialState, event: UserEvents): UserStore => {
    if (event.type === 'user/error') {
        return {
            ...state,
            fetchStatus: FetchStatus.error,
        };
    }

    if (event.type === 'user/loading') {
        return {
            ...state,
            fetchStatus: FetchStatus.loading,
        };
    }

    if (event.type === 'user/none') {
        return {
            ...initialState,
            fetchStatus: FetchStatus.none,
        };
    }

    if (event.type === 'user/success') {
        return {
            ...state,
            ...event.data,
            fetchStatus: FetchStatus.successed,
        };
    }

    return state;
};
