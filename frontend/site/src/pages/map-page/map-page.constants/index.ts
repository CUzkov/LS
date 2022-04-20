import { ReactNode } from 'react';
// import { StringParam, BooleanParam } from 'use-query-params';

import { getMainPage, getAllMaps, getUserPage, getMap } from 'constants/routers';

export const getPaths = (username: string, entityName: ReactNode, entityValue = '') => [
    {
        title: 'Главная',
        url: getMainPage(),
    },
    {
        title: username,
        url: getUserPage(username),
    },
    {
        title: 'Все карты',
        url: getAllMaps(username),
    },
    {
        title: entityName,
        url: getMap(username, entityValue),
    },
];

export const queryParamConfig = {};
