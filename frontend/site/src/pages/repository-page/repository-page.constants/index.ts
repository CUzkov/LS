import { StringParam } from 'use-query-params';

import { getMainPage, getAllRepositories, getUserPage, getRepository } from 'constants/routers';

export const getPaths = (username: string, entityName = 'error', entityValue = '') => [
    {
        title: 'Главная',
        url: getMainPage,
    },
    {
        title: username,
        url: getUserPage(username),
    },
    {
        title: 'Все репозитории',
        url: getAllRepositories(username),
    },
    {
        title: entityName,
        url: getRepository(username, entityValue),
    },
];

export const queryParamConfig = {
    pathToDir: StringParam,
};
