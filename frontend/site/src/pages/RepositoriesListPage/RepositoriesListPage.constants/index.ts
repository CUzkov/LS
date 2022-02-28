import { cn } from 'utils/classname';
import { getMainPage, getAllRepositories, getUserPage } from 'constants/routers';

export const cnRepositoriesListPage = cn('repositories-list-page')();
export const cnItems = cn('repositories-list-page', 'items')();

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
        title: 'Все репозитории',
        url: getAllRepositories(username),
    },
];
