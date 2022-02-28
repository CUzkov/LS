import React from 'react';

import FileIcon from './assets/file.svg';
import MapIcon from './assets/map.svg';
import SettingsIcon from './assets/settings.svg';

import { getAllMaps, getMapCreate, getRepositoryCreate, getAllRepositories } from 'constants/routers';

import { cn } from 'utils/classname';

export const cnMenu = cn('menu')();
export const cnMenuItem = cn('menu', 'item')();
export const cnMenuDivider = cn('menu', 'divider')();

export const getMenu = (username: string) => [
    {
        title: 'Карты',
        icon: <MapIcon />,
        links: [
            {
                title: 'Создать',
                url: getMapCreate(username),
            },
            {
                title: 'Все карты',
                url: getAllMaps(username),
            },
        ],
    },
    {
        title: 'Репозитории',
        icon: <FileIcon />,
        links: [
            {
                title: 'Создать',
                url: getRepositoryCreate(username),
            },
            {
                title: 'Все репозитории',
                url: getAllRepositories(username),
            },
        ],
    },
    {
        title: 'Настройки',
        icon: <SettingsIcon />,
        links: [],
    },
];
