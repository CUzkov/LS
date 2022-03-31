import { useQueryParams } from 'use-query-params';
import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { FilesCard as FilesCardBase } from 'components/FilesCard';
import { getDownloadLink } from 'utils/urls';
import { FileMeta } from 'types';
import { deleteFileOrDir, renameFileOrDir } from 'actions/repository-editor';
import { textInputPopup } from 'constants/popups';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';

import { queryParamConfig } from '../repository-page.constants';
import DownloadIcon from '../repository-page.assets/download.svg';

import styles from './style.scss';

type RepositoryPageFilesCardProps = {
    isEditing: boolean;
};

export const RepositoryPageFilesCard: FC<RepositoryPageFilesCardProps> = ({ isEditing }) => {
    const {repository, files, currentPath} = useSelector((root) => root.repositoryPage);
    const [, setQuery] = useQueryParams(queryParamConfig);
    const dispatch = useDispatch();
    const context = useContext(MovablePopupManagerContext);

    const handleClickDir = useCallback(
        (pathToDir: string[]) => {
            setQuery({ pathToDir: pathToDir.join('~') });
        },
        [dispatch],
    );

    const handleClickToUpDir = useCallback(() => {
        const newPath = currentPath;
        newPath.pop();

        const pathToDir = newPath.join('~');

        setQuery({ pathToDir: pathToDir || undefined });
    }, [currentPath]);

    const handleDeleteButtonClick = useCallback((file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        deleteFileOrDir(dispatch, file);
    }, []);

    const handleRenameButtonClick = useCallback(async (file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();

        const newName = await textInputPopup(
            context,
            file.isDir ? 'Введите новое имя папки' : 'Введите новое мя файла',
            file.name,
            true,
        );

        renameFileOrDir(dispatch, newName, file);
    }, []);

    return (
        <FilesCardBase
            files={files ?? []}
            path={currentPath}
            onClickDir={handleClickDir}
            onClickToUpDir={handleClickToUpDir}
            actions={(file) => (
                <div className={styles.actions}>
                    {isEditing && (
                        <>
                            <button
                                className={cn(styles.actionIcon, styles.textButton)}
                                onClick={(e) => handleRenameButtonClick(file, e)}
                            >
                                {'переименовать'}
                            </button>
                            <button
                                className={cn(styles.actionIcon, styles.textButton)}
                                onClick={(e) => handleDeleteButtonClick(file, e)}
                            >
                                {/* {file.actions.includes(FantomActions.delete) ? 'восстановить' : 'удалить'} */}
                            </button>
                        </>
                    )}
                    <a
                        href={getDownloadLink(repository?.id ?? 0, file.pathToFile.join('~'))}
                        target="_blank"
                        download={file.isDir ? `${file.name}.zip` : file.name}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className={styles.actionIcon}>
                            <DownloadIcon />
                        </div>
                    </a>
                </div>
            )}
        />
    );
};
