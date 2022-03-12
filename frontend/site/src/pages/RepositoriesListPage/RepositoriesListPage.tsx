import React, { useEffect, useMemo, FC } from 'react';
import { useQueryParams, StringParam, NumberParam, BooleanParam } from 'use-query-params';

import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { ItemCard } from 'components/ItemCard';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { RepositoriesPageFilters } from 'components/RepositoriesPageFilters';
import { getRepository } from 'constants/routers';
import { PageTitle } from 'components/PageTitle';

import { getPaths } from './RepositoriesListPage.constants';

import styles from './style.scss';

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
            <div className={styles.repositoriesListPage}>
                <PageTitle title={'Репозитории'} rightChild={<RepositoriesPageFilters />} />
                <div>
                    {repositories.data.map((repository, index) => (
                        <ItemCard
                            title={repository.title}
                            key={index}
                            link={getRepository(username, String(repository.id))}
                        />
                    ))}
                </div>
            </div>
        ),
        [repositories],
    );

    return <PageWrapper content={content} paths={paths} />;
};
