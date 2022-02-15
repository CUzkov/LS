import React, { useEffect, useMemo, FC, useCallback } from 'react';
import { useQueryParams, StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { getPaths, cnItems, cnRepositoriesListPage, cnTitle } from './RepositoriesListPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { ItemCard } from 'components/ItemCard';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { RepositoriesPageFilters } from 'components/RepositoriesPageFilters';

import './style.scss';

export const RepositoriesListPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repositories } = useSelector((root) => root.repositoriesListPage);
    const dispatch = useDispatch();

    const [query] = useQueryParams({
        by_user: NumberParam,
        is_rw: BooleanParam,
        is_rwa: BooleanParam,
        title: StringParam,
    });

    useEffect(() => {
        getPageRepositoriesByFilters(dispatch, {
            by_user: query.by_user || -1,
            is_rw: Boolean(query.is_rw),
            is_rwa: Boolean(query.is_rwa),
            title: query.title || '',
        });
    }, []);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnRepositoriesListPage}>
                <div className={cnTitle}>
                    Репозитории
                    <RepositoriesPageFilters />
                </div>
                <div className={cnItems}>
                    {repositories.data.map((map, index) => (
                        <ItemCard title={map.title} key={index} />
                    ))}
                </div>
            </div>
        ),
        [repositories],
    );

    return <PageWrapper content={content} paths={paths} />;
};
