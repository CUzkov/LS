import { useQueryParams } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import {
    getPageRepositoriesById,
    getFilesByDirPath,
    changeFilesDirPath,
    addFantomFile,
    deleteFantomFile,
} from 'actions/repository-page';
import { useBooleanState } from 'hooks';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';
import { yesNoPopup } from 'constants/popups';

import { getPaths } from './repository-page.constants';
import { RepositoryPageFilesCard } from './repository-page.files-card';
import { RepositoryPageHeader } from './repository-page.header';
import { queryParamConfig } from './repository-page.constants';
import { getFantomFileKey, getDirPathByKey, getDirKeyByPath } from './repository-page.utils';

import styles from './style.scss';

export const RepositoryPage: FC = () => {
    const dispatch = useDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const context = useContext(MovablePopupManagerContext);

    const { username } = useSelector((root) => root.user);
    const { repository, files, unsavedChanges } = useSelector((root) => root.repositoryPage);
    const { id } = useParams();

    const [isEditing, , endEditing, toggleEditing] = useBooleanState(false);
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

                const unsavedFileKey = getFantomFileKey([...files.path], file.name, false);
                const duplicateFiles =
                    files.data?.filter(({ name, isDir }) => (isDir ? undefined : name) === file.name) ?? [];
                const duplicateFileInNew = unsavedChanges[unsavedFileKey];

                if (duplicateFiles.length) {
                    const isRewrite = await yesNoPopup(
                        context,
                        'Конфликт',
                        `Файл ${file.name} уже существует в данной папке, хотите перезаписать его?`,
                        true,
                    );

                    if (isRewrite) {
                        addFantomFile(dispatch, [...files.path], file, unsavedFileKey, 'rewrite', false);
                    }

                    continue;
                }

                if (duplicateFileInNew) {
                    const isReadd = await yesNoPopup(
                        context,
                        'Конфликт',
                        `Файл с названием ${file.name} уже добавлен ранее, хотите заменить его?`,
                        true,
                    );

                    if (isReadd) {
                        deleteFantomFile(dispatch, unsavedFileKey);
                        addFantomFile(dispatch, [...files.path], file, unsavedFileKey, 'add', false);
                    }

                    continue;
                }

                addFantomFile(dispatch, [...files.path], file, unsavedFileKey, 'add', false);
            }
        },
        [files, unsavedChanges],
    );

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(dispatch, { id: Number(id) });
        }
    }, [id]);

    useEffect(() => {
        getFilesByDirPath(dispatch, { repositoryId: Number(id), pathToDir: query.pathToDir || '' });
        changeFilesDirPath(dispatch, getDirPathByKey(query.pathToDir));
    }, [query.pathToDir]);

    const additionalPaths = useMemo(
        () => getDirPathByKey(query.pathToDir).map((path) => ({ title: path, url: '' })),
        [query.pathToDir],
    );
    const paths = useMemo(
        () => getPaths(username, repository.data?.title, String(repository.data?.id)).concat(additionalPaths),
        [username, repository, additionalPaths],
    );
    const content = useMemo(
        () => (
            <div className={styles.repositoryPage}>
                <RepositoryPageHeader
                    isEditing={isEditing}
                    inputRef={inputRef}
                    endEditing={endEditing}
                    toggleEditing={toggleEditing}
                />
                <div style={{ pointerEvents: 'all' }}>
                    <RepositoryPageFilesCard isEditing={isEditing} />
                </div>
                <input type="file" ref={inputRef} multiple className={styles.fileInput} onChange={handleChangeInput} />
            </div>
        ),
        [repository, files, toggleEditing, isEditing],
    );

    return <PageWrapper content={content} paths={paths} />;
};
