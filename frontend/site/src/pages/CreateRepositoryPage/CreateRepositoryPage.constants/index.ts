import { cn } from '../../../utils';
import { getMainPage, getUserPage, getUserRepositoryCreate } from 'constants/routers';

export const cnCreateRepositoryPage = cn('create-repository-page')();
export const cnCreateRepositoryPageTitle = cn('create-repository-page', 'title')();
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
        url: getUserRepositoryCreate(username),
    },
];
