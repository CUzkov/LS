import { cn } from '../../../utils';
import { getMainPage, getUserMaps, getUserPage } from 'constants/routers';

export const cnRepositoriesListPage = cn('repositories-list-page')();
export const cnTitle = cn('repositories-list-page')('title');
export const cnItems = cn('repositories-list-page')('items');

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
        title: 'Мои репозитории',
        url: getUserMaps(username),
    },
];
