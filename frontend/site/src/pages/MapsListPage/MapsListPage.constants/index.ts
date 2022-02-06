import { cn } from '../../../utils';
import { getMainPage, getUserMaps, getUserPage } from 'constants/routers';

export const cnMapsListPage = cn('maps-list-page')();
export const cnMapsListPageTitle = cn('maps-list-page')('title');
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
        url: getUserMaps(username),
    },
];
