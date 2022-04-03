import React, { useEffect, useMemo } from 'react';
import type { FC } from 'react';

import { PageWrapper } from 'pages/page-wrapper';
import { useDispatch, useSelector } from 'store/store';
import { getMapsListPageAllMaps } from 'actions/maps-list-page';
import { ItemCard } from 'components/ItemCard';
import { PageTitle } from 'components/PageTitle';

import {getPaths} from './MapsListPage.constants'

export const MapsListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { maps } = useSelector((root) => root.mapsListPage);
    const dispatch = useDispatch();

    useEffect(() => {
        getMapsListPageAllMaps(dispatch);
    }, []);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div>
                <PageTitle title={'Ваши карты'} />
                <div>
                    {maps.data.map((map, index) => (
                        <ItemCard title={map.title} key={index} link={''} />
                    ))}
                </div>
            </div>
        ),
        [maps],
    );

    return <PageWrapper content={content} paths={paths} />;
};
