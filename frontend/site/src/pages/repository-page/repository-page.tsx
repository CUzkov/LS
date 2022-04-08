import { useQueryParams } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import {
    getPageRepositoriesById,
    getFilesByPath,
    addFile,
    changeFilesDirPath,
    clearRepositoryPage,
} from 'actions/repository-page';
import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { FetchStatus, FileStatus } from 'types';
import { yesNoPopup } from 'constants/popups';
import Spinner from 'assets/spinner.svg';

import { getPaths } from './repository-page.constants';
import { RepositoryPageFilesCard } from './repository-page.files-card';
import { RepositoryPageHeader } from './repository-page.header';
import { getDirPathByKey } from './repository-page.utils';
import { queryParamConfig } from './repository-page.constants';

import styles from './style.scss';

export const RepositoryPage: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const context = useContext(MovablePopupManagerContext);
    const { username } = useSelector((root) => root.user);
    const { repository, files, currentPath, repositoryFetchStatus, repositoryVersion } = useSelector(
        (root) => root.repositoryPage,
    );
    const isRepositoryLoading = repositoryFetchStatus === FetchStatus.loading;
    const { id } = useParams();
    const [query, setQuery] = useQueryParams(queryParamConfig);
    const isEditing = query.isEditing ?? false;

    const handleChangeInput = useCallback(
        async (event: React.ChangeEvent<HTMLInputElement>) => {
            const filesToAdd = event.target.files;

            if (!filesToAdd?.length) {
                return;
            }

            for (let i = 0; i < filesToAdd.length; i++) {
                const file = filesToAdd.item(i);

                if (!file) {
                    continue;
                }

                // @FIXME добавить поиск дубликатов в удалённых файлах
                const duplicateFiles = files.filter(({ name }) => name === file.name) ?? [];

                if (duplicateFiles.length) {
                    const isRewrite = await yesNoPopup(
                        context,
                        'Конфликт',
                        duplicateFiles[0].status === FileStatus.delete
                            ? `Вы удалили файл с названием ${file.name}. Хотите перезаписать его?`
                            : `Файл ${file.name} уже существует в данной папке, хотите перезаписать его?`,
                        true,
                    );

                    if (isRewrite) {
                        addFile(file, true);
                    }

                    continue;
                }

                addFile(file);
            }
        },
        [files, currentPath, repository],
    );

    const handleToggleEditing = useCallback(() => {
        setQuery({ isEditing: !query.isEditing });
    }, [query.isEditing]);

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(Number(id), query.version ?? undefined);
        }
    }, [id]);

    useEffect(() => {
        if (repository?.id) {
            // query.pathToDir включает в себя dirName
            getFilesByPath([query.fullPathToDir || ''], '', isEditing, query.version ?? undefined);
            setQuery({ version: repositoryVersion });
        }
        changeFilesDirPath(getDirPathByKey(query.fullPathToDir));
    }, [repository?.id]);

    useEffect(() => {
        return () => clearRepositoryPage();
    }, []);

    const additionalPaths = useMemo(
        () => getDirPathByKey(query.fullPathToDir).map((path) => ({ title: path, url: '' })),
        [query.fullPathToDir],
    );

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

        return basePaths.concat(additionalPaths.filter((path) => path.title !== '.'));
    }, [username, repository, additionalPaths, isRepositoryLoading]);

    const content = useMemo(
        () => (
            <div className={styles.repositoryPage}>
                <RepositoryPageHeader isEditing={isEditing} inputRef={inputRef} toggleEditing={handleToggleEditing} />
                <div style={{ pointerEvents: 'all' }}>
                    <RepositoryPageFilesCard isEditing={isEditing} isRepositoryLoading={isRepositoryLoading} />
                </div>
                <input type="file" ref={inputRef} multiple className={styles.fileInput} onChange={handleChangeInput} />
            </div>
        ),
        [repository, files, handleToggleEditing, isEditing, currentPath],
    );

    return <PageWrapper content={content} paths={paths} />;
};
