import { createStore, applyMiddleware, combineReducers } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';
import { useSelector as _useSelector, useDispatch as _useDispatch } from 'react-redux';

import { userReducer, UserStore, UserEvents } from './reducers/user';
import { loginFormReducer, LoginFormStore, LoginFormEvents } from './reducers/login-form';
import { mainPageReducer, MainPageStore, MainPageEvents } from './reducers/main-page';
import { mapsListPageReducer, MapsListPageStore, MapsListPageEvents } from './reducers/maps-list-page';
import { createMapFormReducer, CreateMapFormStore, CreateMapFormEvents } from './reducers/create-map-form';
import { loggerReducer, LoggerStore, LoggerEvents } from './reducers/logger';
import { repositoryPageReducer, RepositoryPageStore, RepositoryPageEvents } from './reducers/repository-page';
import {
    repositoriesListPageReducer,
    RepositoriesListPageStore,
    RepositoriesListPageEvents,
} from './reducers/repositories-list-page';
import {
    createRepositoryFormReducer,
    CreateRepositoryFormStore,
    CreateRepositoryFormEvents,
} from './reducers/create-repository-form';
import { mapPageReducer, MapPageStore, MapPageEvents } from './reducers/map-page';

const rootReducer = combineReducers({
    user: userReducer,
    loginForm: loginFormReducer,
    mainPage: mainPageReducer,
    mapsListPage: mapsListPageReducer,
    createMapForm: createMapFormReducer,
    logger: loggerReducer,
    createRepositoryForm: createRepositoryFormReducer,
    repositoriesListPage: repositoriesListPageReducer,
    repositoryPage: repositoryPageReducer,
    mapPage: mapPageReducer,
});
export const store = createStore(rootReducer, composeWithDevTools(applyMiddleware(thunk)));

export type StoreEvents =
    | UserEvents
    | LoginFormEvents
    | MainPageEvents
    | MapsListPageEvents
    | CreateMapFormEvents
    | LoggerEvents
    | CreateRepositoryFormEvents
    | RepositoriesListPageEvents
    | RepositoryPageEvents
    | MapPageEvents;

export interface Store {
    user: UserStore;
    loginForm: LoginFormStore;
    mainPage: MainPageStore;
    mapsListPage: MapsListPageStore;
    createMapForm: CreateMapFormStore;
    logger: LoggerStore;
    createRepositoryForm: CreateRepositoryFormStore;
    repositoriesListPage: RepositoriesListPageStore;
    repositoryPage: RepositoryPageStore;
    mapPage: MapPageStore;
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
