import { useQueryParams, StringParam } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import cn from 'classnames';

import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { PageTitle } from 'components/PageTitle';
import {
    getPageRepositoriesById,
    getFilesByDirPath,
    changeFilesDirPath,
    addFantomFile,
    clearFantomFiles,
    deleteFantomFile,
} from 'actions/repository-page';
import { FilesCard } from 'components/FilesCard';
import { useBooleanState } from 'hooks';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';

import EditIcon from './RepositoryPage.assets/edit.svg';
import { getPaths } from './RepositoryPage.constants';

import styles from './style.scss';

const DUPLICATED_FILES = 'DUPLICATED_FILES';
const DUPLICATED_NEW_FILES = 'DUPLICATED_NEW_FILES';

export const RepositoryPage: FC = () => {
    const dispatch = useDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const context = useContext(MovablePopupManagerContext);

    const { username } = useSelector((root) => root.user);
    const { repository, files, unsavedChanges } = useSelector((root) => root.repositoryPage);
    const { id } = useParams();

    const [isEditing, , endEditing, toggleEditing] = useBooleanState(false);
    const [query, setQuery] = useQueryParams({ pathToDir: StringParam });

    const currendDirFantomFiles = useMemo(() => {
        return Object.entries(unsavedChanges)
            .filter(([, change]) => change.fileMeta.pathToFile.join('~') === files.path.join('~'))
            .map(([key, change]) => ({
                fantomKey: key,
                ...change.fileMeta,
                pathToFile: [...change.fileMeta.pathToFile],
            }));
    }, [unsavedChanges, files]);

    const handleToggleEditing = useCallback(() => {
        if (isEditing && Object.keys(unsavedChanges).length) {
            const isCancelEditing = confirm('Вы хотите выйти из режима редактирования и отменить изменения?');

            if (isCancelEditing) {
                endEditing();
                clearFantomFiles(dispatch);
            }

            return;
        }

        toggleEditing();
    }, [toggleEditing, isEditing, unsavedChanges, dispatch]);

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

    const handleAddFile = useCallback(() => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.files = null;
        inputRef.current.value = '';
        inputRef.current.click();
    }, [inputRef]);

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

                const duplicateFiles = files.data?.filter(({ name }) => name === file.name) ?? [];
                const duplicateFileInNew = Object.entries(unsavedChanges).filter(
                    ([, { fileMeta }]) => fileMeta.name === file.name,
                );

                if (duplicateFiles.length) {
                    const isRewrite = await new Promise<boolean>((resolve) => {
                        context.addPopup({
                            id: DUPLICATED_FILES,
                            content: `Файл ${file.name} уже существует в данной папке, хотите перезаписать его?`,
                            isRequired: true,
                            title: 'Конфликт',
                            buttons: [
                                {
                                    text: 'нет',
                                    action: () => {
                                        resolve(false);
                                        context.removePopup(DUPLICATED_FILES);
                                    },
                                },
                                {
                                    text: 'да',
                                    action: () => {
                                        resolve(true);
                                        context.removePopup(DUPLICATED_FILES);
                                    },
                                },
                            ],
                        });
                    });

                    if (isRewrite) {
                        const key = file.name + (new Date().getTime() + i);
                        addFantomFile(dispatch, [...files.path], file, key, 'rewrite');
                    }

                    continue;
                }

                if (duplicateFileInNew.length) {
                    const isReadd = await new Promise<boolean>((resolve) => {
                        context.addPopup({
                            id: DUPLICATED_NEW_FILES,
                            content: `Файл с названием ${file.name} уже добавлен ранее, хотите заменить его?`,
                            isRequired: true,
                            title: 'Конфликт',
                            buttons: [
                                {
                                    text: 'нет',
                                    action: () => {
                                        resolve(false);
                                        context.removePopup(DUPLICATED_NEW_FILES);
                                    },
                                },
                                {
                                    text: 'да',
                                    action: () => {
                                        resolve(true);
                                        context.removePopup(DUPLICATED_NEW_FILES);
                                    },
                                },
                            ],
                        });
                    });

                    if (isReadd) {
                        const key = file.name + (new Date().getTime() + i);
                        deleteFantomFile(dispatch, duplicateFileInNew[0][0]);
                        addFantomFile(dispatch, [...files.path], file, key, 'add');
                    }

                    continue;
                }

                const key = file.name + (new Date().getTime() + i);
                addFantomFile(dispatch, [...files.path], file, key, 'add');
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
            <div className={styles.repositoryPage}>
                <PageTitle
                    title={repository.data?.title}
                    rightChild={
                        <div>
                            <div
                                className={cn(styles.editIcon, isEditing && styles.editing)}
                                onClick={handleToggleEditing}
                            >
                                <EditIcon />
                            </div>
                        </div>
                    }
                />
                <div style={{pointerEvents: 'all'}}>
                    <FilesCard
                        files={files.data ?? []}
                        repositoryId={repository.data?.id ?? 0}
                        path={files.path}
                        onClickDir={handleClickDir}
                        onClickToUpDir={handleClickToUpDir}
                        onClickAddFile={handleAddFile}
                        isEditing={isEditing}
                        fantomFiles={currendDirFantomFiles}
                    />
                </div>
                <input type="file" ref={inputRef} multiple className={styles.fileInput} onChange={handleChangeInput} />
            </div>
        ),
        [repository, files, toggleEditing, isEditing, currendDirFantomFiles],
    );

    return <PageWrapper content={content} paths={paths} />;
};
