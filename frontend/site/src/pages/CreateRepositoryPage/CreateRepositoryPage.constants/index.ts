import { cn } from 'utils/classname';
import { getMainPage, getUserPage, getRepositoryCreate } from 'constants/routers';

export const cnCreateRepositoryPage = cn('create-repository-page')();
export const cnCreateRepositoryPageForm = cn('create-repository-page', 'form')();

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
        title: 'Создание нового репозитория',
        url: getRepositoryCreate(username),
    },
];
