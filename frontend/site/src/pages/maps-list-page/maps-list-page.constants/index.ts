import { StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { getMainPage, getAllMaps, getUserPage } from 'constants/routers';
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
        title: 'Карты знаний',
        url: getAllMaps(username),
    },
];

export const options = [
    {
        title: 'Все доступные карты',
        value: RWA.r,
    },
    {
        title: 'Карты с разрешённой записью',
        value: RWA.rw,
    },
    {
        title: 'Карты с полным доступом',
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
