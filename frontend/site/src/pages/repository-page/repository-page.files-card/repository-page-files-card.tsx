import { useQueryParams } from 'use-query-params';
import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { FilesCard as FilesCardBase } from 'components/FilesCard';
import { getDownloadLink } from 'utils/urls';
import { DirMeta, DirStatus, FetchStatus, FileMeta, FileStatus } from 'types';
import { textInputPopup } from 'constants/popups';
import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { deleteFileOrDir, renameFileOrDir, getFilesByPath, changeFilesDirPath } from 'actions/repository-page';

import { queryParamConfig } from '../repository-page.constants';
import DownloadIcon from '../repository-page.assets/download.svg';
import { getDirPathByKey } from '../repository-page.utils';

import styles from './style.scss';

type ActionsProps = {
    isEditing: boolean;
    isRenameDisable: boolean;
    isDownloadDisable: boolean;
    downloadName: string;
    downloadLink: string;
    onClickDelete: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
    onClickRename: (e: React.MouseEvent<HTMLButtonElement>) => void | Promise<void>;
};

const Actions = ({
    isEditing,
    isRenameDisable,
    isDownloadDisable,
    downloadName,
    downloadLink,
    onClickDelete,
    onClickRename,
}: ActionsProps) => {
    return (
        <div className={styles.actions}>
            {isEditing && (
                <>
                    <button
                        className={cn(styles.actionIcon, styles.textButton, isRenameDisable && styles.disable)}
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
            <a
                href={downloadLink}
                target="_blank"
                download={downloadName}
                onClick={(e) => e.stopPropagation()}
                className={cn(styles.downloadIconWrapper, isDownloadDisable && styles.disable)}
            >
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
            const newPath = [...pathToDir, dirName];
            setQuery({ fullPathToDir: [...pathToDir, dirName].join('~') });
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

    const handleFileRenameButtonClick = useCallback(async (file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newName = await textInputPopup(context, 'Введите новое имя файла', file.name, true);
        renameFileOrDir(file, newName);
    }, []);

    const handleDirRenameButtonClick = useCallback(async (dir: DirMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        const newName = await textInputPopup(context, 'Введите новое имя папки', dir.name, true);
        renameFileOrDir(dir, newName);
    }, []);

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
                        isDownloadDisable={file.status === FileStatus.delete}
                        isEditing={isEditing}
                        isRenameDisable={file.status === FileStatus.delete}
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
                        isDownloadDisable={dir.status === DirStatus.delete}
                        isEditing={isEditing}
                        isRenameDisable={dir.status === DirStatus.delete}
                        onClickDelete={(e) => handleDeleteButtonClick(dir, e)}
                        onClickRename={(e) => handleDirRenameButtonClick(dir, e)}
                    />
                )}
            />
        </div>
    );
};
