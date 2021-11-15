import { FetchStatus } from '../../types';

export interface IUserStoreD {
    userId?: number;
    username?: string;
    email?: string;
    isAdmin?: boolean;
    fetchStatus?: FetchStatus;
}

export type UserEvents = { type: 'FAILED' } | { type: 'SUCCESS'; data: IUserStoreD } | { type: 'LOADING' };

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
    fetchStatus: FetchStatus.none,
};

export const userReducer = (state: UserStore = initialState, event: UserEvents): UserStore => {
    if (event.type === 'FAILED') {
        return {
            ...state,
            fetchStatus: FetchStatus.failed,
        };
    }

    return state;
};
