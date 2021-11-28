import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { useSelector as _useSelector, useDispatch as _useDispatch } from 'react-redux';

import { userReducer, UserStore, UserEvents } from './reducers/user';
import { loginFormReducer, LoginFormStore, LoginFormEvents } from './reducers/loginForm';
import { mainPageReducer, MainPageStore, MainPageEvents } from './reducers/mainPage';
import { mapsListPageReducer, MapsListPageStore, MapsListPageEvents } from './reducers/mapsListPage';

const rootReducer = combineReducers({
    user: userReducer,
    loginForm: loginFormReducer,
    mainPage: mainPageReducer,
    mapsListPage: mapsListPageReducer,
});
export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export type StoreEvents = UserEvents | LoginFormEvents | MainPageEvents | MapsListPageEvents;
export interface Store {
    user: UserStore;
    loginForm: LoginFormStore;
    mainPage: MainPageStore;
    mapsListPage: MapsListPageStore;
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
