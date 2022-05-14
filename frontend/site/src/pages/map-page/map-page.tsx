import React, { useEffect, useMemo, FC } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { getMapById, clearMapPage } from 'actions/map-page';
import { FetchStatus, RWA } from 'types';
import { PageTitle } from 'components/page-title';
import Spinner from 'assets/spinner.svg';

import { getPaths } from './map-page.constants';
import { MapsPageActions } from './map-page.actions';
import { Graph } from './map-page.graph';

import styles from './style.scss';

export const MapPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { mapFetchStatus, map } = useSelector((root) => root.mapPage);
    const isMapLoading = mapFetchStatus === FetchStatus.loading;
    const { id } = useParams();
    const isCanEdit = map?.access === RWA.rw || map?.access === RWA.rwa;

    useEffect(() => {
        if (id) {
            getMapById(Number(id));
        }
    }, [id]);

    useEffect(() => () => clearMapPage(), []);

    const paths = useMemo(() => {
        const basePaths = getPaths(username, map?.title, map?.id ?? -1);

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

    const content = (
        <div className={styles.mapPage}>
            <PageTitle title={map?.title} rightChild={isCanEdit && <MapsPageActions />} />
            <div className={styles.map}>
                <div className={cn(styles.mapContent, map && styles.show)}>
                    <Graph map={map} />
                </div>
                <div className={cn(styles.mapSpinner, !map && styles.show)}>
                    <Spinner />
                </div>
            </div>
        </div>
    );

    return <PageWrapper content={content} paths={paths} />;
};
