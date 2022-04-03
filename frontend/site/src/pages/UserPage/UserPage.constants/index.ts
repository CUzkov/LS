import { getMainPage, getUserPage } from 'constants/routers';

export const getPaths = (username: string) => [
    {
        title: 'Главная',
        url: getMainPage,
    },
    {
        title: username,
        url: getUserPage(username),
    },
];
