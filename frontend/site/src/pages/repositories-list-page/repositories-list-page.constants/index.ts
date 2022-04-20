import { getMainPage, getAllRepositories, getUserPage } from 'constants/routers';

export const getPaths = (username: string) => [
    {
        title: 'Главная',
        url: getMainPage(),
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
