import React from 'react';
import type { FC } from 'react';

import { paths } from './MainPage.constants';
import { PageWrapper } from 'pages/PageWrapper';

import styles from './style.scss';

export const MainPage: FC = () => {
    const content = <div className={styles.mainPage}></div>;

    return <PageWrapper content={content} paths={paths} />;
};
