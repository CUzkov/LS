import { getMainPage, getUserPage, getMapCreate } from 'constants/routers';

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
        title: 'Создание новой карты',
        url: getMapCreate(username),
    },
];
