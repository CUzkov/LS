import { getGroupsByFilter } from '../handlers/groups/get-groups-by-filters';
import { createGroup } from '../handlers/groups/create-group';
import { addGroupToGroup } from '../handlers/groups/add-group-to-group';
import { checkIsGroupNameFree } from '../handlers/groups/check-is-group-name-free';
import { getFullGroupById } from '../handlers/groups/get-full-group-by-id';
import { addRepositoryToGroup } from '../handlers/groups/add-repository-to-group';

import { Route, Method } from '../types';

const CHECK_IS_GROUP_NAME_FREE_URL = '/api/group/free';
const CREATE_GROUP_URL = '/api/group/create';
const GET_FULL_GROUP_BY_ID = '/api/group/full';
const GROUPS_BY_FILTERS_URL = '/api/group/filter';
const ADD_GROUP_TO_GROUP_URL = '/api/group/add-group';
const ADD_REPOSITORY_TO_GROUP_URL = '/api/group/add-repository';

export const GROUPS_ROUTES: Record<string, Route> = {
    [CHECK_IS_GROUP_NAME_FREE_URL]: {
        name: 'checkIsGroupNameFree',
        callback: checkIsGroupNameFree,
        method: Method.post,
        isNeedAuth: true,
    },
    [CREATE_GROUP_URL]: {
        name: 'createGroup',
        callback: createGroup,
        method: Method.post,
        isNeedAuth: true,
    },
    [GET_FULL_GROUP_BY_ID]: {
        name: 'getFullGroupById',
        callback: getFullGroupById,
        method: Method.get,
        isNeedAuth: true,
    },
    [GROUPS_BY_FILTERS_URL]: {
        name: 'getGroupsByFilter',
        callback: getGroupsByFilter,
        method: Method.get,
        isNeedAuth: true,
    },
    [ADD_GROUP_TO_GROUP_URL]: {
        name: 'addGroupToGroup',
        callback: addGroupToGroup,
        method: Method.post,
        isNeedAuth: true,
    },
    [ADD_REPOSITORY_TO_GROUP_URL]: {
        name: 'addRepositoryToGroup',
        callback: addRepositoryToGroup,
        method: Method.post,
        isNeedAuth: true,
    },
};
