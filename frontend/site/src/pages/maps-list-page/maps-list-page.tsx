import React, { useCallback, useEffect, useMemo } from 'react';
import { useQueryParams } from 'use-query-params';
import type { FC } from 'react';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { getMapsByFiltersMaps } from 'actions/maps-list-page';
import { ItemCard } from 'components/ItemCard';
import { PageTitle } from 'components/PageTitle';
import { FetchStatus } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { getMap } from 'constants/routers';
import { Paginator } from 'components/paginator';

import { MapsPageFilters } from './maps-list-page.filters';
import { getPaths, queryParams } from './maps-list-page.constants';

import styles from './styles.scss';

export const MapsListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { groups, groupsFetchStatus, groupsCount } = useSelector((root) => root.mapsListPage);
    const [query, setQuery] = useQueryParams(queryParams);

    const handlePageChange = useCallback((value: number) => {
        setQuery({ page: value === 1 ? undefined : value });
    }, []);

    useEffect(() => {
        getMapsByFiltersMaps({
            by_user: -1,
            is_rw: !!query.is_rw,
            is_rwa: !!query.is_rwa,
            title: query.title || '',
            page: query.page || 1,
        });
    }, [query.page]);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={styles.mapsListPage}>
                <PageTitle title={'Карты знаний'} rightChild={<MapsPageFilters />} />
                <div className={styles.maps}>
                    {groupsFetchStatus === FetchStatus.successed &&
                        groups.map((map, index) => (
                            <ItemCard title={map.title} key={index} link={getMap(username, String(map.id))} />
                        ))}
                    {groupsFetchStatus === FetchStatus.loading && (
                        <div className={styles.spinner}>
                            <SpinnerIcon />
                        </div>
                    )}
                </div>
                {Boolean(groupsCount) && (
                    <div className={styles.paginator}>
                        <Paginator onChangePage={handlePageChange} page={query.page || 1} pageQuantity={groupsCount} />
                    </div>
                )}
            </div>
        ),
        [groups, groupsFetchStatus, query.page, groupsCount],
    );

    return <PageWrapper content={content} paths={paths} />;
};
