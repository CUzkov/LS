import { getMainPage, getUserPage, getRepositoryCreate } from 'constants/routers';

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
