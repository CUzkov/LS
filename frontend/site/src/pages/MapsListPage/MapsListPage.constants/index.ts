import { cn } from '../../../utils';
import { getMainPage, getUserMaps, getUserPage } from 'constants/routers';

export const cnMapsListPage = cn('MapsListPage')();
export const cnMapsListPageTitle = cn('MapsListPage-Title')();
export const cnMapsListPageItems = cn('MapsListPage-Items')();

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
        title: 'Все карты',
        url: getUserMaps(username),
    },
];
