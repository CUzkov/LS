import React from 'react';

import FileIcon from './assets/file.svg';
import MapIcon from './assets/map.svg';
import SettingsIcon from './assets/settings.svg';

import { getUserMaps } from 'constants/routers';

import { cn } from '../../../utils';

export const cnMenu = cn('Menu')();
export const cnMenuItem = cn('Menu-Item')();
export const cnMenuDivider = cn('Menu-Divider')();

export const getMenu = (username: string) => [
    {
        title: 'Карты',
        icon: <MapIcon />,
        links: [
            {
                title: 'Создать',
                url: '',
            },
            {
                title: 'Мои карты',
                url: getUserMaps(username),
            },
            {
                title: 'Все карты',
                url: '',
            },
        ],
    },
    {
        title: 'Репозитории',
        icon: <FileIcon />,
        links: [
            {
                title: 'Создать',
                url: '',
            },
            {
                title: 'Мои репозитории',
                url: '',
            },
            {
                title: 'Все репозитории',
                url: '',
            },
        ],
    },
    {
        title: 'Настройки',
        icon: <SettingsIcon />,
        links: [],
    },
];
