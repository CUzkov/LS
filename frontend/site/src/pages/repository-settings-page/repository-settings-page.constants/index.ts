import { ReactNode } from 'react';

import { getMainPage, getAllRepositories, getUserPage, getRepository } from 'constants/routers';
import { SelectOption } from 'components/fields';
import { RWA } from 'types';

export const getPaths = (username: string, entityName: ReactNode, entityValue: number) => [
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
    {
        title: 'Настройки',
        url: getAllRepositories(username),
    },
];

export const options: SelectOption[] = [
    {
        title: 'RWA - доступ на чтение, запись и выдачу доступа',
        value: RWA.rwa,
    },
    {
        title: 'RW - доступ на чтение и запись',
        value: RWA.rw,
    },
    {
        title: 'R - доступ только на чтение',
        value: RWA.r,
    },
    {
        title: 'запретить доступ',
        value: RWA.none,
    },
];
