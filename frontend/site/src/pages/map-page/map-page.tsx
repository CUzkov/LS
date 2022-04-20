import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { FetchStatus } from 'types';
import Spinner from 'assets/spinner.svg';

import { getPaths } from './map-page.constants';
import {Graph} from './map-page.graph'

import styles from './style.scss';
import { PageTitle } from 'components/PageTitle';

export const MapPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repository, files, currentPath, repositoryFetchStatus, repositoryVersion } = useSelector(
        (root) => root.repositoryPage,
    );
    const isRepositoryLoading = repositoryFetchStatus === FetchStatus.loading;
    const { id } = useParams();
    // const [query, setQuery] = useQueryParams(queryParamConfig);

    useEffect(() => {
        if (id) {
            // getPageRepositoriesById(Number(id), query.version ?? undefined);
        }
    }, [id]);

    const paths = useMemo(() => {
        const basePaths = getPaths(username, repository?.title, String(repository?.id));

        if (isRepositoryLoading) {
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
    }, [username, repository, isRepositoryLoading]);

    const content = useMemo(
        () => (
            <div className={styles.mapPage}>
                <PageTitle title={'Project X'} />
                <div className={styles.graph}>
                    <Graph />
                </div>
            </div>
        ),
        [repository, files, currentPath],
    );

    return <PageWrapper content={content} paths={paths} />;
};
