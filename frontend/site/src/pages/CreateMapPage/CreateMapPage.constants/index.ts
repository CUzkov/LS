import { cn } from 'utils/classname';
import { getMainPage, getUserPage, getMapCreate } from 'constants/routers';

export const cnCreateMapPage = cn('create-map-page')();
export const cnCreateMapPageTitle = cn('create-map-page', 'title')();
export const cnCreateMapPageForm = cn('create-map-page', 'form')();

export const getPaths = (username: string) => [
    {
        title: 'Главная',
        url: getMainPage,
    },
    {
        title: username,
        url: getUserPage(username),
    },
    {
        title: 'Создание новой карты',
        url: getMapCreate(username),
    },
];
