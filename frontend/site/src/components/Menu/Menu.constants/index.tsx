import React from 'react';

import FileIcon from './assets/file.svg';
import MapIcon from './assets/map.svg';
import SettingsIcon from './assets/settings.svg';

import { getUserMaps, getUserMapCreate, getUserRepositoryCreate, getUserRepositories } from 'constants/routers';

import { cn } from '../../../utils';

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
                url: getUserMapCreate(username),
            },
            {
                title: 'Все карты',
                url: getUserMaps(username),
            },
        ],
    },
    {
        title: 'Репозитории',
        icon: <FileIcon />,
        links: [
            {
                title: 'Создать',
                url: getUserRepositoryCreate(username),
            },
            {
                title: 'Все репозитории',
                url: getUserRepositories(username),
            },
        ],
    },
    {
        title: 'Настройки',
        icon: <SettingsIcon />,
        links: [],
    },
];
