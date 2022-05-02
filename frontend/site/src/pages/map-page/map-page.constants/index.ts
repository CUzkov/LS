import { ReactNode } from 'react';

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
        title: 'Карты знаний',
        url: getAllMaps(username),
    },
    {
        title: entityName,
        url: getMap(username, entityValue),
    },
];

export const queryParamConfig = {};
