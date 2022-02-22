import { getRepositoriesByFilter, createRepository, checkIsRepositoryNameFree } from '../handlers';
import { Route, Method } from '../types';
import { REPOSITORIES_BY_FILTERS_URL, CREATE_REPOSITORY_URL, CHECK_IS_REPOSIROTY_NAME_FREE_URL } from './constants';

export const REPOSITORIES_ROUTES: Record<string, Route> = {
    [REPOSITORIES_BY_FILTERS_URL]: {
        name: 'repositoriesByFilter',
        callback: getRepositoriesByFilter,
        method: Method.get,
        isNeedAuth: true,
    },
    [CREATE_REPOSITORY_URL]: {
        name: 'createRepository',
        callback: createRepository,
        method: Method.post,
        isNeedAuth: true,
    },
    [CHECK_IS_REPOSIROTY_NAME_FREE_URL]: {
        name: 'checkIsRepositoryNameFree',
        callback: checkIsRepositoryNameFree,
        method: Method.post,
        isNeedAuth: true,
    },
};
