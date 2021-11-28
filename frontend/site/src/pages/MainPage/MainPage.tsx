import React from 'react';
import type { FC } from 'react';

import { cnMainPage } from './MainPage.constants';
import { PageWrapper } from 'pages/PageWrapper';

import './style.scss';

const PATHS = [
    {
        title: 'Главная',
        url: '/',
    },
];

export const MainPage: FC = () => {
    const content = <div className={cnMainPage}></div>;

    return <PageWrapper content={content} paths={PATHS} />;
};
