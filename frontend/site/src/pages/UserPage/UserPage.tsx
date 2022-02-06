import React, { useEffect, useMemo } from 'react';
import type { FC } from 'react';

import { cnUserPage, getPaths, cnUserPageTitle } from './UserPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useSelector } from 'store/store';

import './style.scss';

export const UserPage: FC = () => {
    const { username } = useSelector((root) => root.user);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnUserPage}>
                <div className={cnUserPageTitle}>Данные пользователя</div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
