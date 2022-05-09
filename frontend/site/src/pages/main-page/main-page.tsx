import React, { FC } from 'react';

import { PageWrapper } from 'pages/page-wrapper';

import { paths } from './main-page.constants';

import styles from './style.scss';

export const MainPage: FC = () => {
    const content = <div className={styles.mainPage}></div>;

    return <PageWrapper content={content} paths={paths} />;
};
