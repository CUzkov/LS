import { ReactNode } from 'react';
import { StringParam, BooleanParam } from 'use-query-params';

import { getMainPage, getAllRepositories, getUserPage, getRepository } from 'constants/routers';

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
        title: 'Все репозитории',
        url: getAllRepositories(username),
    },
    {
        title: entityName,
        url: getRepository(username, entityValue),
    },
];

export const queryParamConfig = {
    fullPathToDir: StringParam,
    isEditing: BooleanParam,
    version: StringParam,
};
