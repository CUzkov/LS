import { checkIsGroupNameFree, createGroup, getFullGroupById, getGroupsByFilter } from '../handlers/groups';
import { Route, Method } from '../types';

const CHECK_IS_GROUP_NAME_FREE_URL = '/api/group/free';
const CREATE_GROUP_URL = '/api/group/create';
const GET_FULL_GROUP_BY_ID = '/api/group/full';
const GROUPS_BY_FILTERS_URL = '/api/group/filter';

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
};
