import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { useSelector as _useSelector, useDispatch as _useDispatch } from 'react-redux';

import { userReducer, UserStore, UserEvents } from './reducers/user';

const rootReducer = combineReducers({ user: userReducer });
export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export type StoreState = UserStore;
export type StoreEvents = UserEvents;
export interface Store {
    user: UserStore;
}
export type Dispatch = (event: StoreEvents) => void;

export const useDispatch = () => {
    const dispatch = _useDispatch();
    return (event: StoreEvents) => {
        dispatch(event);
    };
};

export const useSelector = <T>(fn: (store: Store) => T): T => {
    return fn(_useSelector<Store, Store>((x) => x));
};
