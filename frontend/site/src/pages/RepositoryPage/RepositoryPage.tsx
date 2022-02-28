import React, { useEffect, useMemo, FC } from 'react';
import { useParams } from 'react-router-dom';

import { getPaths, cnRepositoryPage, cnTitle } from './RepositoryPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { getPageRepositoriesById } from 'actions/repository-page';
import { FilesCard } from 'components/FilesCard';

import './style.scss';

export const RepositoryPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repository, files } = useSelector((root) => root.repositoryPage);
    const dispatch = useDispatch();

    const { id } = useParams();

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(dispatch, { id: Number(id) });
        }
    }, [id]);

    const paths = useMemo(() => getPaths(username, repository.data?.title), [username, repository]);
    const content = useMemo(
        () => (
            <div className={cnRepositoryPage}>
                <div className={cnTitle}>{repository.data?.title}</div>
                <FilesCard files={files.data ?? []} repositoryId={repository.data?.id ?? 0} />
            </div>
        ),
        [repository, files],
    );

    return <PageWrapper content={content} paths={paths} />;
};
