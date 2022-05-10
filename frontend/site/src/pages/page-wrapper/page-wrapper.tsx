import React, { ReactElement, ReactNode } from 'react';
import type { FC } from 'react';

import { Menu } from 'components/menu';
import { Breadcrumbs } from 'components/breadcrumbs';

import styles from './style.scss';

interface IPageWrapperProps {
    content: ReactElement;
    paths: {
        title: ReactNode;
        url?: string;
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
