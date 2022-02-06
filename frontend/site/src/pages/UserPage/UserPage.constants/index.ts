import { cn } from '../../../utils';
import { getMainPage, getUserPage } from 'constants/routers';

export const cnUserPage = cn('user-page')();
export const cnUserPageTitle = cn('user-page')('title');

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
