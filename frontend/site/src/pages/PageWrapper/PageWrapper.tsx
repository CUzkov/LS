import React, { ReactElement } from 'react';
import type { FC } from 'react';

import { Menu } from 'components/Menu';
import { Breadcrumbs } from 'components/Breadcrumbs';

import styles from './style.scss';

interface IPageWrapperProps {
    content: ReactElement;
    paths: {
        title: string;
        url: string;
    }[];
}

export const PageWrapper: FC<IPageWrapperProps> = ({ paths, content }) => {
    return (
        <div className={styles.pageWrapper}>
            <Breadcrumbs paths={paths} />
            <div className={styles.page}>
                <div className={styles.menu}>
                    <Menu />
                </div>
                <div className={styles.content}>{content}</div>
            </div>
        </div>
    );
};
