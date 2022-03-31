import { useQueryParams } from 'use-query-params';
import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { FilesCard as FilesCardBase } from 'components/FilesCard';
import { getDownloadLink } from 'utils/urls';
import { FetchStatus, FileMeta, FileStatus } from 'types';
import { textInputPopup } from 'constants/popups';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';
import { deleteFile } from 'actions/repository-page';

import { queryParamConfig } from '../repository-page.constants';
import DownloadIcon from '../repository-page.assets/download.svg';

import styles from './style.scss';

type RepositoryPageFilesCardProps = {
    isEditing: boolean;
};

export const RepositoryPageFilesCard: FC<RepositoryPageFilesCardProps> = ({ isEditing }) => {
    const { repository, files, currentPath, filesFetchStatus } = useSelector((root) => root.repositoryPage);
    const [, setQuery] = useQueryParams(queryParamConfig);
    const dispatch = useDispatch();
    const context = useContext(MovablePopupManagerContext);

    const handleClickDir = useCallback(
        (pathToDir: string[], dirName: string) => {
            setQuery({ fullPathToDir: [...pathToDir, dirName].join('~') });
        },
        [dispatch],
    );

    const handleClickToUpDir = useCallback(() => {
        const newPath = currentPath;
        newPath.pop();

        const pathToDir = newPath.join('~');

        setQuery({ fullPathToDir: pathToDir || undefined });
    }, [currentPath]);

    const handleDeleteButtonClick = useCallback((file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        deleteFile(file);
    }, []);

    const handleRestoreButtonClick = useCallback((file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
    }, []);

    const handleRenameButtonClick = useCallback(async (file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        const newName = await textInputPopup(
            context,
            file.isDir ? 'Введите новое имя папки' : 'Введите новое мя файла',
            file.name,
            true,
        );
    }, []);

    return (
        <div className={styles.filesCard}>
            <FilesCardBase
                files={files ?? []}
                path={currentPath}
                onClickDir={handleClickDir}
                onClickToUpDir={handleClickToUpDir}
                isLoaded={filesFetchStatus === FetchStatus.successed}
                isLoading={filesFetchStatus === FetchStatus.loading}
                actions={(file) => (
                    <div className={styles.actions}>
                        {isEditing && (
                            <>
                                <button
                                    className={cn(styles.actionIcon, styles.textButton, file.status === FileStatus.delete && styles.disable)}
                                    onClick={(e) => handleRenameButtonClick(file, e)}
                                >
                                    {'переименовать'}
                                </button>
                                <button
                                    className={cn(styles.actionIcon, styles.textButton)}
                                    onClick={(e) =>
                                        file.status === FileStatus.delete
                                            ? handleRestoreButtonClick(file, e)
                                            : handleDeleteButtonClick(file, e)
                                    }
                                >
                                    {file.status === FileStatus.delete ? 'восстановить' : 'удалить'}
                                </button>
                            </>
                        )}
                        <a
                            href={getDownloadLink(repository?.id ?? 0, file.pathToFile.concat([file.name]).join('~'))}
                            target="_blank"
                            download={file.isDir ? `${file.name}.zip` : file.name}
                            onClick={(e) => e.stopPropagation()}
                            className={cn(styles.downloadIconWrapper, file.status === FileStatus.delete && styles.disable)}
                        >
                            <button className={styles.actionIcon}>
                                <DownloadIcon />
                            </button>
                        </a>
                    </div>
                )}
            />
        </div>
    );
};
