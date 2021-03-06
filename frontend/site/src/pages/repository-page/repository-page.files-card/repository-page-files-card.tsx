import { useQueryParams } from 'use-query-params';
import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { FilesCard as FilesCardBase } from 'components/files-card';
import { getDownloadLink } from 'utils/urls';
import { DirMeta, FetchStatus, FileMeta } from 'types';
import { textInputPopup } from 'constants/popups';
import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { deleteFileOrDir, renameFileOrDir, getFilesByPath, changeFilesDirPath } from 'actions/repository-page';
import { fileNameValidator, requiredValidate } from 'utils/final-forms';

import { queryParamConfig } from '../repository-page.constants';
import DownloadIcon from '../repository-page.assets/download.svg';

import styles from './style.scss';

type ActionsProps = {
    isEditing: boolean;
    downloadName: string;
    downloadLink: string;
    onClickDelete: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    onClickRename: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
};

const Actions = ({ isEditing, downloadName, downloadLink, onClickDelete, onClickRename }: ActionsProps) => {
    return (
        <div className={styles.actions}>
            {isEditing && (
                <>
                    <button
                        className={cn(styles.actionIcon, styles.textButton)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickRename(e);
                        }}
                    >
                        {'переименовать'}
                    </button>
                    <button
                        className={cn(styles.actionIcon, styles.textButton)}
                        onClick={(e) => {
                            e.stopPropagation();
                            onClickDelete(e);
                        }}
                    >
                        {'удалить'}
                    </button>
                </>
            )}
            <a href={downloadLink} target="_blank" download={downloadName} onClick={(e) => e.stopPropagation()}>
                <button className={styles.actionIcon}>
                    <DownloadIcon />
                </button>
            </a>
        </div>
    );
};

type RepositoryPageFilesCardProps = {
    isEditing: boolean;
    isRepositoryLoading: boolean;
};

export const RepositoryPageFilesCard: FC<RepositoryPageFilesCardProps> = ({ isEditing, isRepositoryLoading }) => {
    const { repository, files, dirs, currentPath, filesAndDirsFetchStatus } = useSelector(
        (root) => root.repositoryPage,
    );
    const [, setQuery] = useQueryParams(queryParamConfig);
    const dispatch = useDispatch();
    const context = useContext(MovablePopupManagerContext);

    const handleClickDir = useCallback(
        (pathToDir: string[], dirName: string) => {
            const newPath = [...pathToDir, dirName].filter(Boolean);
            setQuery({ fullPathToDir: newPath.join('~') });
            getFilesByPath(newPath, '', isEditing);
            changeFilesDirPath(newPath);
        },
        [dispatch],
    );

    const handleClickToUpDir = useCallback(() => {
        const newPath = currentPath;
        newPath.pop();

        const pathToDir = newPath.join('~');

        setQuery({ fullPathToDir: pathToDir || undefined });
        getFilesByPath(newPath, '', isEditing);
        changeFilesDirPath(newPath);
    }, [currentPath]);

    const handleDeleteButtonClick = useCallback((file: FileMeta | DirMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        deleteFileOrDir(file);
    }, []);

    const handleFileRenameButtonClick = useCallback(
        async (file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            const newName = await textInputPopup(
                context,
                'Введите новое имя файла',
                file.name,
                true,
                [
                    requiredValidate,
                    fileNameValidator,
                    (value: string) => (file.name === value ? '  ' : undefined),
                    // @FIXME добавить проверку на беке
                    (value: string) =>
                        files
                            .map((file) => file.name)
                            .filter((name) => file.name !== name)
                            .includes(value)
                            ? 'файл с таким названием уже существует'
                            : undefined,
                ],
                true,
            );

            if (!newName) {
                return;
            }

            renameFileOrDir(file, newName);
        },
        [files],
    );

    const handleDirRenameButtonClick = useCallback(
        async (dir: DirMeta, e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            const newName = await textInputPopup(
                context,
                'Введите новое имя папки',
                dir.name,
                true,
                [
                    requiredValidate,
                    fileNameValidator,
                    // @FIXME добавить проверку на беке
                    (value: string) =>
                        dirs
                            .map((dir) => dir.name)
                            .filter((name) => dir.name !== name)
                            .includes(value)
                            ? 'папка с таким названием уже существует'
                            : undefined,
                ],
                true,
            );

            if (!newName) {
                return;
            }

            renameFileOrDir(dir, newName);
        },
        [dirs],
    );

    return (
        <div className={styles.filesCard}>
            <FilesCardBase
                files={files ?? []}
                dirs={dirs || []}
                path={currentPath}
                onClickDir={handleClickDir}
                onClickToUpDir={handleClickToUpDir}
                isLoaded={filesAndDirsFetchStatus === FetchStatus.successed}
                isLoading={filesAndDirsFetchStatus === FetchStatus.loading || isRepositoryLoading}
                actionsForFiles={(file) => (
                    <Actions
                        downloadLink={getDownloadLink(
                            repository?.id ?? 0,
                            file.pathToFile.join('~'),
                            file.name,
                            isEditing,
                        )}
                        downloadName={file.name}
                        isEditing={isEditing}
                        onClickDelete={(e) => handleDeleteButtonClick(file, e)}
                        onClickRename={(e) => handleFileRenameButtonClick(file, e)}
                    />
                )}
                actionsForDirs={(dir) => (
                    <Actions
                        downloadLink={getDownloadLink(
                            repository?.id ?? 0,
                            dir.pathToDir.join('~'),
                            dir.name,
                            isEditing,
                        )}
                        downloadName={`${dir.name}.zip`}
                        isEditing={isEditing}
                        onClickDelete={(e) => handleDeleteButtonClick(dir, e)}
                        onClickRename={(e) => handleDirRenameButtonClick(dir, e)}
                    />
                )}
            />
        </div>
    );
};
