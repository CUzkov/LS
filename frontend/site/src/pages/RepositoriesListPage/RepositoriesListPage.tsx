import React, { useEffect, useMemo } from 'react';
import type { FC } from 'react';

import { getPaths, cnItems, cnRepositoriesListPage, cnTitle } from './RepositoriesListPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { ItemCard } from 'components/ItemCard';

import './style.scss';

export const RepositoriesListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { maps } = useSelector((root) => root.mapsListPage);
    const dispatch = useDispatch();

    useEffect(() => {
    }, []);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnRepositoriesListPage}>
                <div className={cnTitle}>Ваши карты</div>
                <div className={cnItems}>
                    {maps.data.map((map, index) => (
                        <ItemCard title={map.title} key={index} />
                    ))}
                </div>
            </div>
        ),
        [maps],
    );

    return <PageWrapper content={content} paths={paths} />;
};
