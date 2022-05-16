import { Node, Edge } from 'react-flow-renderer';

import { FetchStatus, FullGroup, Group, Repository } from 'types';

export type MapPageEvents =
    | { type: 'map-page/map/success'; data: FullGroup }
    | { type: 'map-page/map/loading' }
    | { type: 'map-page/map/error' }
    | { type: 'map-page/searched/start' }
    | { type: 'map-page/searched/clear' }
    | { type: 'map-page/searched/error' }
    | { type: 'map-page/searched-maps/success'; data: { groups: Group[]; count: number } }
    | {
          type: 'map-page/searched-repositories/success';
          data: { repositories: { repository: Repository; version: string }[]; count: number };
      }
    | { type: 'map-page/tree/set-nodes'; data: Node[] }
    | { type: 'map-page/tree/set-edges'; data: Edge[] }
    | { type: 'map-page/adding/loading' }
    | { type: 'map-page/adding/error' }
    | { type: 'map-page/adding/success' }
    | { type: 'map-page/clear' };

export type MapPageStore = {
    map?: FullGroup;
    mapFetchStatus: FetchStatus;
    popupSearchingFetchStatus: FetchStatus;
    searchedMaps: Group[];
    searchedRepositories: Repository[];
    tree: {
        nodes: Node[];
        edges: Edge[];
    };
    addingFetchStatuses: FetchStatus;
};

const initialState: MapPageStore = {
    map: undefined,
    mapFetchStatus: FetchStatus.none,
    popupSearchingFetchStatus: FetchStatus.none,
    searchedMaps: [],
    searchedRepositories: [],
    tree: {
        edges: [],
        nodes: [],
    },
    addingFetchStatuses: FetchStatus.none,
};

export const mapPageReducer = (state: MapPageStore = initialState, event: MapPageEvents): MapPageStore => {
    const result = { ...state };

    if (event.type === 'map-page/map/success') {
        result.map = event.data;
        result.mapFetchStatus = FetchStatus.successed;
    }

    if (event.type === 'map-page/map/loading') {
        result.mapFetchStatus = FetchStatus.loading;
        result.map = undefined;
    }

    if (event.type === 'map-page/map/error') {
        result.mapFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-page/searched/start') {
        result.popupSearchingFetchStatus = FetchStatus.loading;
    }

    if (event.type === 'map-page/searched-maps/success') {
        result.popupSearchingFetchStatus = FetchStatus.successed;
        result.searchedMaps = event.data.groups;
    }

    if (event.type === 'map-page/searched/error') {
        result.popupSearchingFetchStatus = FetchStatus.error;
    }

    if (event.type === 'map-page/searched-repositories/success') {
        result.popupSearchingFetchStatus = FetchStatus.successed;
        result.searchedRepositories = event.data.repositories.map(({ repository }) => repository);
    }

    if (event.type === 'map-page/searched/clear') {
        result.searchedMaps = [];
        result.searchedRepositories = [];
        result.popupSearchingFetchStatus = FetchStatus.none;
    }

    if (event.type === 'map-page/tree/set-nodes') {
        result.tree.nodes = event.data;
    }

    if (event.type === 'map-page/tree/set-edges') {
        result.tree.edges = event.data;
    }

    if (event.type === 'map-page/adding/loading') {
        result.addingFetchStatuses = FetchStatus.loading;
    }

    if (event.type === 'map-page/adding/success') {
        result.addingFetchStatuses = FetchStatus.successed;
    }

    if (event.type === 'map-page/adding/error') {
        result.addingFetchStatuses = FetchStatus.error;
    }

    if (event.type === 'map-page/clear') {
        result.map = undefined;
        result.addingFetchStatuses = FetchStatus.none;
        result.mapFetchStatus = FetchStatus.none;
        result.popupSearchingFetchStatus = FetchStatus.none;
        result.searchedMaps = [];
        result.tree = {
            edges: [],
            nodes: [],
        };
    }

    return result;
};
