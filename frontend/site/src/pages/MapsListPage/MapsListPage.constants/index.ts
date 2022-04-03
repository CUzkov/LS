import { getMainPage, getAllMaps, getUserPage } from 'constants/routers';

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
        url: getAllMaps(username),
    },
];
