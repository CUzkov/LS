import { StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { getMainPage, getAllRepositories, getUserPage } from 'constants/routers';
import { RWA } from 'types';

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
        title: 'Все репозитории',
        url: getAllRepositories(username),
    },
];

export const filtersOptions = [
    {
        title: 'Все доступные репозитории',
        value: RWA.r,
    },
    {
        title: 'Репозитории с разрешённой записью',
        value: RWA.rw,
    },
    {
        title: 'Репозитории с полным доступом',
        value: RWA.rwa,
    },
];

export const queryParams = {
    by_user: NumberParam,
    is_rw: BooleanParam,
    is_rwa: BooleanParam,
    title: StringParam,
    page: NumberParam,
};
