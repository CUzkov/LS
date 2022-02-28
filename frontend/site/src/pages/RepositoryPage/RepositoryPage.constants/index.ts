import { cn } from 'utils/classname';
import { getMainPage, getAllRepositories, getUserPage, getRepository } from 'constants/routers';

export const cnRepositoryPage = cn('repository-page')();
export const cnTitle = cn('repository-page', 'title')();

export const getPaths = (username: string, entityName = 'error') => [
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
    {
        title: entityName,
        url: getRepository(username, entityName),
    },
];
