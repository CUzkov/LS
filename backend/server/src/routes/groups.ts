import { checkIsGroupNameFree, createGroup } from '../handlers/groups';
import { Route, Method } from '../types';

const CHECK_IS_GROUP_NAME_FREE_URL = '/api/group/free';
const CREATE_GROUP_URL = '/api/group/create';

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
};
