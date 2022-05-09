import React, { useEffect, useMemo, FC } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { getMapById } from 'actions/map-page';
import { FetchStatus } from 'types';
import { PageTitle } from 'components/page-title';
import Spinner from 'assets/spinner.svg';

import { getPaths } from './map-page.constants';
import { MapsPageActions } from './map-page.actions';
import { Tree } from './map-page.tree';

import styles from './style.scss';

export const MapPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { mapFetchStatus, map } = useSelector((root) => root.mapPage);
    const isMapLoading = mapFetchStatus === FetchStatus.loading;
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getMapById(Number(id));
        }
    }, [id]);

    const paths = useMemo(() => {
        const basePaths = getPaths(username, map?.title, String(map?.id));

        if (isMapLoading) {
            basePaths[basePaths.length - 1] = {
                title: (
                    <div className={styles.breadcrumbsSpinner}>
                        <Spinner />
                    </div>
                ),
                url: '',
            };
        }

        return basePaths;
    }, [username, map, isMapLoading]);

    const content = useMemo(
        () => (
            <div className={styles.mapPage}>
                <PageTitle title={map?.title} rightChild={<MapsPageActions />} />
                <div className={styles.graph}>{map && <Tree group={map} />}</div>
            </div>
        ),
        [map],
    );

    return <PageWrapper content={content} paths={paths} />;
};
