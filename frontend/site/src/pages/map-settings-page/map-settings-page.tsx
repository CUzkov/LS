import React, { useEffect, useMemo, FC } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/page-wrapper';
import Spinner from 'assets/spinner.svg';
import { useSelector } from 'store';
import { PageTitle } from 'components/page-title';
import { FetchStatus } from 'types';
import { getMapById, clearMapSettingsPage } from 'actions/map-settings-page';

import { getPaths } from './map-settings-page.constants';
import { MainSettings } from './map-settings-page.main-settings';
import { AccessSettings } from './map-settings-page.access-settings';

import styles from './style.scss';

export const MapSettingsPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { map, mapFetchStatus } = useSelector((root) => root.mapSettingsPage);
    const { id } = useParams();
    const isMapLoading = mapFetchStatus === FetchStatus.loading;

    useEffect(() => {
        if (id) {
            getMapById(Number(id));
        }

        return () => clearMapSettingsPage();
    }, [id]);

    const paths = useMemo(() => {
        const basePaths = getPaths(username, map?.title, map?.id ?? -1);

        if (isMapLoading) {
            [1, 2].map((numb) => {
                basePaths[basePaths.length - numb] = {
                    title: (
                        <div className={styles.breadcrumbsSpinner}>
                            <Spinner />
                        </div>
                    ),
                    url: '',
                };
            });
        }

        return basePaths;
    }, [username, isMapLoading, map?.title]);

    const content = (
        <div className={styles.mapSettingsPage}>
            <PageTitle title={map?.title} />
            <div style={{ pointerEvents: 'all' }} className={styles.settingsBlocks}>
                <div className={styles.mainSettings}>
                    <MainSettings />
                </div>
                <div className={styles.accessSettings}>
                    <AccessSettings />
                </div>
            </div>
        </div>
    );

    return <PageWrapper content={content} paths={paths} />;
};
