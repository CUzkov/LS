import React, { useEffect, useMemo, FC } from 'react';
import { useQueryParams, StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { ItemCard } from 'components/ItemCard';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { RepositoriesPageFilters } from 'components/RepositoriesPageFilters';
import { getRepository } from 'constants/routers';
import { PageTitle } from 'components/PageTitle';
import { FetchStatus } from 'types';
import SpinnerIcon from 'assets/spinner.svg';

import { getPaths } from './repositories-list-page.constants';

import styles from './style.scss';

export const RepositoriesListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repositories, fetchStatus } = useSelector((root) => root.repositoriesListPage);

    const [query] = useQueryParams({
        by_user: NumberParam,
        is_rw: BooleanParam,
        is_rwa: BooleanParam,
        title: StringParam,
    });

    useEffect(() => {
        getPageRepositoriesByFilters({
            by_user: query.by_user || -1,
            is_rw: Boolean(query.is_rw),
            is_rwa: Boolean(query.is_rwa),
            title: query.title || '',
        });
    }, []);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={styles.repositoriesListPage}>
                <PageTitle title={'Репозитории'} rightChild={<RepositoriesPageFilters />} />
                <div className={styles.repositories}>
                    {fetchStatus === FetchStatus.successed &&
                        repositories.map(({ repository }, index) => (
                            <ItemCard
                                title={repository.title}
                                key={index}
                                link={getRepository(username, String(repository.id))}
                            />
                        ))}
                    {fetchStatus === FetchStatus.loading && (
                        <div className={styles.spinner}>
                            <SpinnerIcon />
                        </div>
                    )}
                </div>
            </div>
        ),
        [repositories, fetchStatus],
    );

    return <PageWrapper content={content} paths={paths} />;
};
