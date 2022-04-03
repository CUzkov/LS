import React, { useMemo } from 'react';
import type { FC } from 'react';

import { getPaths } from './UserPage.constants';
import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';

import './style.scss';

export const UserPage: FC = () => {
    const { username } = useSelector((root) => root.user);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div>
                <div>Данные пользователя</div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
