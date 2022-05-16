import React, { useEffect, useMemo, FC } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/page-wrapper';
import Spinner from 'assets/spinner.svg';
import { useSelector } from 'store';
import { PageTitle } from 'components/page-title';
import { FetchStatus } from 'types';
import { getRepositoryById, clearRepositorySettingsPage } from 'actions/repository-settings-page';

import { getPaths } from './repository-settings-page.constants';
import { MainSettings } from './repository-settings-page.main-settings';
import { AccessSettings } from './repository-settings-page.access-settings';

import styles from './style.scss';

export const RepositorySettingsPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repository, repositoryFetchStatus } = useSelector((root) => root.repositorySettingsPage);
    const { id } = useParams();
    const isRepositoryLoading = repositoryFetchStatus === FetchStatus.loading;

    useEffect(() => {
        if (id) {
            getRepositoryById(Number(id));
        }

        return () => clearRepositorySettingsPage();
    }, [id]);

    const paths = useMemo(() => {
        const basePaths = getPaths(username, repository?.title, repository?.id ?? -1);

        if (isRepositoryLoading) {
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
    }, [username, repository, isRepositoryLoading]);

    const content = (
        <div className={styles.repositorySettingsPage}>
            <PageTitle title={repository?.title} />
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
