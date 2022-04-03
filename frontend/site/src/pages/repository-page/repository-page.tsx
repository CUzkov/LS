import { useQueryParams } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/PageWrapper';
import { useSelector } from 'store/store';
import { getPageRepositoriesById, getFilesByDirPath, addFile, changeFilesDirPath } from 'actions/repository-page';
import { useBooleanState } from 'hooks';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';
import { yesNoPopup } from 'constants/popups';

import { getPaths } from './repository-page.constants';
import { RepositoryPageFilesCard } from './repository-page.files-card';
import { RepositoryPageHeader } from './repository-page.header';
import { getDirPathByKey } from './repository-page.utils';
import { queryParamConfig } from './repository-page.constants';

import styles from './style.scss';
import { FileStatus } from 'types';

export const RepositoryPage: FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const context = useContext(MovablePopupManagerContext);

    const { username } = useSelector((root) => root.user);
    const { repository, files, currentPath } = useSelector((root) => root.repositoryPage);
    const { id } = useParams();

    const [isEditing, , , toggleEditing] = useBooleanState(false);
    const [query] = useQueryParams(queryParamConfig);

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

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(Number(id));
        }
    }, [id]);

    useEffect(() => {
        if (repository?.id) {
            // query.pathToDir включает в себя dirName
            getFilesByDirPath([query.fullPathToDir || ''], '', isEditing);
        }
        changeFilesDirPath(getDirPathByKey(query.fullPathToDir));
    }, [query.fullPathToDir, repository?.id, isEditing]);

    const additionalPaths = useMemo(
        () => getDirPathByKey(query.fullPathToDir).map((path) => ({ title: path, url: '' })),
        [query.fullPathToDir],
    );
    const paths = useMemo(
        () => getPaths(username, repository?.title, String(repository?.id)).concat(additionalPaths.filter(path => path.title !== '.')),
        [username, repository, additionalPaths],
    );
    const content = useMemo(
        () => (
            <div className={styles.repositoryPage}>
                <RepositoryPageHeader isEditing={isEditing} inputRef={inputRef} toggleEditing={toggleEditing} />
                <div style={{ pointerEvents: 'all' }}>
                    <RepositoryPageFilesCard isEditing={isEditing} />
                </div>
                <input type="file" ref={inputRef} multiple className={styles.fileInput} onChange={handleChangeInput} />
            </div>
        ),
        [repository, files, toggleEditing, isEditing, currentPath],
    );

    return <PageWrapper content={content} paths={paths} />;
};
