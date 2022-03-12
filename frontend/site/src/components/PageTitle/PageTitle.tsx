import React, { ReactNode } from 'react';
import type { FC } from 'react';

import styles from './style.scss';

interface PageTitleProps {
    title: ReactNode;
    rightChild?: ReactNode;
}

export const PageTitle: FC<PageTitleProps> = ({ title, rightChild }: PageTitleProps) => {
    return (
        <div className={styles.pageTitle}>
            <div className={styles.text}>{title}</div>
            {rightChild && <div>{rightChild}</div>}
        </div>
    );
};
