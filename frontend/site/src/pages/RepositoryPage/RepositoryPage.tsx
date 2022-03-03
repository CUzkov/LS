import { useQueryParams, StringParam } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';

import { getPaths, cnRepositoryPage, cnTitle } from './RepositoryPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { getPageRepositoriesById, getFilesByDirPath, changeFilesDirPath } from 'actions/repository-page';
import { FilesCard } from 'components/FilesCard';

import './style.scss';

export const RepositoryPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { repository, files } = useSelector((root) => root.repositoryPage);
    const dispatch = useDispatch();
    const { id } = useParams();

    const [query, setQuery] = useQueryParams({
        pathToDir: StringParam,
    });

    const handleClickDir = useCallback(
        (pathToDir: string[]) => {
            setQuery({ pathToDir: pathToDir.join('~') });
        },
        [dispatch],
    );

    const handleClickToUpDir = useCallback(() => {
        const newPath = files.path;
        newPath.pop();

        const pathToDir = newPath.join('~');

        setQuery({ pathToDir: pathToDir || undefined });
    }, [files]);

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(dispatch, { id: Number(id) });
        }
    }, [id]);

    useEffect(() => {
        getFilesByDirPath(dispatch, { repositoryId: Number(id), pathToDir: query.pathToDir ?? '' });
        changeFilesDirPath(dispatch, query.pathToDir?.split('~') ?? []);
    }, [query.pathToDir]);

    const additionalPaths = useMemo(
        () => query.pathToDir?.split('~').map((path) => ({ title: path, url: '' })) ?? [],
        [query.pathToDir],
    );
    const paths = useMemo(
        () => getPaths(username, repository.data?.title, String(repository.data?.id)).concat(additionalPaths),
        [username, repository, additionalPaths],
    );
    const content = useMemo(
        () => (
            <div className={cnRepositoryPage}>
                <div className={cnTitle}>{repository.data?.title}</div>
                <FilesCard
                    files={files.data ?? []}
                    repositoryId={repository.data?.id ?? 0}
                    path={files.path}
                    onClickDir={handleClickDir}
                    onClickToUpDir={handleClickToUpDir}
                />
            </div>
        ),
        [repository, files],
    );

    return <PageWrapper content={content} paths={paths} />;
};
