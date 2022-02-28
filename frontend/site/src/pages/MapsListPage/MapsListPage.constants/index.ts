import { cn } from 'utils/classname';
import { getMainPage, getAllMaps, getUserPage } from 'constants/routers';

export const cnMapsListPage = cn('maps-list-page')();
export const cnMapsListPageItems = cn('maps-list-page')('items');

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
        title: 'Мои карты',
        url: getAllMaps(username),
    },
];
