import {
    Node,
    Edge,
    applyEdgeChanges as applyEdgeChangesCore,
    applyNodeChanges as applyNodeChangesCore,
    NodeChange,
    EdgeChange,
} from 'react-flow-renderer';

import { ajax } from 'ajax';
import { Empty, FullGroup, Group, GroupType, IServerError, Repository } from 'types';
import { Dispatch, store } from 'store';

const SEARCH_FILTER_QUANTITY = 5;

const GET_FULL_GROUP_BY_ID = '/api/group/full';
const GROUPS_BY_FILTERS_URL = '/api/group/filter';
const ADD_GROUP_TO_GROUP_URL = '/api/group/add-group';
const REPOSITORIES_BY_FILTERS_URL = '/api/repository/filter';
const ADD_REPOSITORY_TO_GROUP_URL = '/api/group/add-repository';

type GetFullGroupByIdQP = {
    groupId: number;
};

type GetFullGroupByIdRD = FullGroup;

export const getMapById = async (groupId: number) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/map/loading' });

    let response: GetFullGroupByIdRD | undefined;

    try {
        response = await ajax.get<GetFullGroupByIdRD, GetFullGroupByIdQP>({
            url: GET_FULL_GROUP_BY_ID,
            queryParams: { groupId },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispatch({ type: 'map-page/map/error' });
        dispatch({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispatch({
        type: 'map-page/map/success',
        data: response,
    });
};

type GetGroupsByTitleQP = {
    title: string;
    groupType: GroupType;
    page: number;
    quantity: number;
    excludeGroupIds: number[];
    is_rw?: boolean;
    is_rwa?: boolean;
    by_user?: number;
};

type GetGroupsByTitleRD = {
    groups: Group[];
    count: number;
};

export const getMapsByTitle = async (title: string, excludeGroupIds: number[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/searched/start' });

    let response: GetGroupsByTitleRD | undefined;

    try {
        response = await ajax.get<GetGroupsByTitleRD, GetGroupsByTitleQP>({
            url: GROUPS_BY_FILTERS_URL,
            queryParams: {
                title,
                groupType: GroupType.map,
                excludeGroupIds,
                page: 1,
                is_rw: true,
                quantity: SEARCH_FILTER_QUANTITY,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispatch({ type: 'map-page/searched/error' });
        dispatch({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispatch({
        type: 'map-page/searched-maps/success',
        data: response,
    });
};

type GetRepositoriesByTitleQP = {
    title: string;
    page: number;
    quantity: number;
    excludeRepositoryIds: number[];
    is_rw?: boolean;
    is_rwa?: boolean;
    by_user?: number;
};

type GetRepositoriesByTitleRD = {
    repositories: {
        repository: Repository;
        version: string;
    }[];
    count: number;
};

export const getRepositoriessByTitle = async (title: string, excludeRepositoryIds: number[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/searched/start' });

    let response: GetRepositoriesByTitleRD | undefined;

    try {
        response = await ajax.get<GetRepositoriesByTitleRD, GetRepositoriesByTitleQP>({
            url: REPOSITORIES_BY_FILTERS_URL,
            queryParams: {
                title,
                excludeRepositoryIds,
                page: 1,
                is_rw: true,
                quantity: SEARCH_FILTER_QUANTITY,
            },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispatch({ type: 'map-page/searched/error' });
        dispatch({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    dispatch({
        type: 'map-page/searched-repositories/success',
        data: response,
    });
};

export const clearSearched = () => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/searched/clear' });
};

export const setNodes = (nodes: Node[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/tree/set-nodes', data: nodes });
};

type addMapToMapD = {
    childId: number;
    parentId: number;
};

export const addMapNodes = async (maps: Group[]) => {
    const dispatch: Dispatch = store.dispatch;
    const {
        mapPage: { map },
    } = store.getState();

    dispatch({ type: 'map-page/adding/loading' });

    try {
        const results = await Promise.allSettled(
            maps.map(async (childMap) => {
                return await ajax.post<addMapToMapD, Empty, Empty>({
                    url: ADD_GROUP_TO_GROUP_URL,
                    data: { childId: childMap.id, parentId: map?.id ?? -1 },
                });
            }),
        );

        if (results.some((result) => result.status === 'rejected')) {
            throw {
                name: 'Ошибка добавления карты в группу',
                description: 'Ошибка доступа!',
            };
        }
    } catch (error) {
        const e = error as IServerError;

        dispatch({ type: 'map-page/adding/error' });
        dispatch({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    map &&
        dispatch({ type: 'map-page/map/success', data: { ...map, childrenGroups: [...map.childrenGroups, ...maps] } });
    dispatch({ type: 'map-page/adding/success' });
};

type AddRepositoryToGroupD = {
    repositoryId: number;
    groupId: number;
};

export const addRepositoryNodes = async (repositories: Repository[]) => {
    const dispatch: Dispatch = store.dispatch;
    const {
        mapPage: { map },
    } = store.getState();

    dispatch({ type: 'map-page/adding/loading' });

    try {
        const results = await Promise.allSettled(
            repositories.map(async (repository) => {
                return await ajax.post<AddRepositoryToGroupD, Empty, Empty>({
                    url: ADD_REPOSITORY_TO_GROUP_URL,
                    data: { groupId: map?.id ?? -1, repositoryId: repository.id },
                });
            }),
        );

        if (results.some((result) => result.status === 'rejected')) {
            throw {
                name: 'Ошибка добавления репозитория в группу',
                description: 'Ошибка доступа!',
            };
        }
    } catch (error) {
        const e = error as IServerError;

        dispatch({ type: 'map-page/adding/error' });
        dispatch({
            type: 'logger/add-log',
            data: { type: 'error', title: e.name, description: e.description },
        });
        return;
    }

    map &&
        dispatch({
            type: 'map-page/map/success',
            data: { ...map, childrenRepositories: [...map.childrenRepositories, ...repositories] },
        });
    dispatch({ type: 'map-page/adding/success' });
};

export const setEdges = (edges: Edge[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/tree/set-edges', data: edges });
};

export const applyNodeChanges = (chs: NodeChange[], nodes: Node[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/tree/set-nodes', data: applyNodeChangesCore(chs, nodes) });
};

export const applyEdgeChanges = (chs: EdgeChange[], edges: Edge[]) => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/tree/set-edges', data: applyEdgeChangesCore(chs, edges) });
};

export const clearMapPage = () => {
    const dispatch: Dispatch = store.dispatch;

    dispatch({ type: 'map-page/clear' });
};
