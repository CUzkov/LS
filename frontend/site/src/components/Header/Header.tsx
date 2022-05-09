import React, { FC } from 'react';

import styles from './style.scss';

export const Header: FC = () => {
    return (
        <div className={styles.header}>
            <div className={styles.headerLeft}>DocsHub</div>
        </div>
    );
};
