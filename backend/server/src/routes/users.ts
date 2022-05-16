import { Route, Method } from '../types';

import { getUsersByFilters } from '../handlers/users/get-users-by-filters';

const GET_USERS_BY_FILTERS = '/api/user/get-by-filters';

export const USERS_ROUTES: Record<string, Route> = {
    [GET_USERS_BY_FILTERS]: {
        name: 'getUsersByFilters',
        callback: getUsersByFilters,
        method: Method.get,
        isNeedAuth: true,
    },
};
