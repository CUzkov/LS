import { StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { getMainPage, getAllMaps, getUserPage } from 'constants/routers';

export const getPaths = (username: string) => [
    {
        title: 'Главная',
        url: getMainPage(),
    },
    {
        title: username,
        url: getUserPage(username),
    },
    {
        title: 'Карты знаний',
        url: getAllMaps(username),
    },
];

export const queryParams = {
    by_user: NumberParam,
    is_rw: BooleanParam,
    is_rwa: BooleanParam,
    title: StringParam,
};
