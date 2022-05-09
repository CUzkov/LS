import React, { useEffect, useMemo, FC, useCallback } from 'react';
import { useQueryParams } from 'use-query-params';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { ItemCard } from 'components/item-card';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { getRepository } from 'constants/routers';
import { PageTitle } from 'components/page-title';
import { FetchStatus } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { Paginator } from 'components/paginator';

import { getPaths, queryParams } from './repositories-list-page.constants';
import { RepositoriesPageFilters } from './repositories-page.filters';

import styles from './style.scss';

export const RepositoriesListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repositories, fetchStatus, repositoriesCount } = useSelector((root) => root.repositoriesListPage);
    const [query, setQuery] = useQueryParams(queryParams);

    const handlePageChange = useCallback((value: number) => {
        setQuery({ page: value === 1 ? undefined : value });
    }, []);

    useEffect(() => {
        getPageRepositoriesByFilters({
            by_user: query.by_user || -1,
            is_rw: Boolean(query.is_rw),
            is_rwa: Boolean(query.is_rwa),
            title: query.title || '',
            page: query.page || 1,
        });
    }, [query.page]);

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
                {Boolean(repositoriesCount) && (
                    <div className={styles.paginator}>
                        <Paginator
                            onChangePage={handlePageChange}
                            page={query.page || 1}
                            pageQuantity={repositoriesCount}
                        />
                    </div>
                )}
            </div>
        ),
        [repositories, fetchStatus],
    );

    return <PageWrapper content={content} paths={paths} />;
};
