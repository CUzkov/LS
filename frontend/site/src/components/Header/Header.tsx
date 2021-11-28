import React from 'react';
import type { FC } from 'react';

import { cnHeader, cnHeaderLeft, cnHeaderRigth } from './Header.constants';

// import UserIcon from './Header.assets/user.svg';

import './style.scss';

export const Header: FC = () => {
    return (
        <div className={cnHeader}>
            <div className={cnHeaderLeft}>DocsHub</div>
            <div className={cnHeaderRigth}>{/* <UserIcon /> */}</div>
        </div>
    );
};
