import React from 'react';
import type { FC } from 'react';

// import UserIcon from './Header.assets/user.svg';

import styles from './style.scss';

export const Header: FC = () => {
    return (
        <div className={styles.Header}>
            <div className={styles.HeaderLeft}>DocsHub</div>
            <div>{/* <UserIcon /> */}</div>
        </div>
    );
};
