import { useQueryParams } from 'use-query-params';
import React, { useMemo, FC, useCallback } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { FilesCard as FilesCardBase } from 'components/FilesCard';
import { getDownloadLink } from 'utils/urls';
import { FileMeta } from 'types';
import { addFantomFile, deleteFantomFile } from 'actions/repository-page';

import { queryParamConfig } from '../repository-page.constants';
import DownloadIcon from '../repository-page.assets/download.svg';
import { getFantomFileKey, getDirKeyByPath } from '../repository-page.utils';

import styles from './style.scss';

type RepositoryPageFilesCardProps = {
    isEditing: boolean;
};

export const RepositoryPageFilesCard: FC<RepositoryPageFilesCardProps> = ({ isEditing }) => {
    const dispatch = useDispatch();

    const { repository, files, unsavedChanges } = useSelector((root) => root.repositoryPage);
    const currentDitPath = files.path;

    const [, setQuery] = useQueryParams(queryParamConfig);

    const currendDirFantomFiles = useMemo(() => {
        return Object.entries(unsavedChanges)
            .filter(([, change]) => getDirKeyByPath(change.fileMeta.pathToFile) === getDirKeyByPath(currentDitPath))
            .map(([, change]) => ({
                ...change.fileMeta,
                isDir: change.fileMeta.isDir,
                pathToFile: [...change.fileMeta.pathToFile],
            }));
    }, [unsavedChanges, files]);

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

    const handleDeleteButtonClick = useCallback(
        (file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            const unsavedFileKey = getFantomFileKey(currentDitPath, file.name, file.isDir);
            const unsavedChangeFile = unsavedChanges[unsavedFileKey];

            if (
                unsavedChangeFile?.fileMeta?.fantom?.action === 'add' ||
                unsavedChangeFile?.fileMeta?.fantom?.action === 'delete'
            ) {
                deleteFantomFile(dispatch, unsavedFileKey);
                return;
            }

            addFantomFile(dispatch, [...currentDitPath], new File([], file.name), unsavedFileKey, 'delete', file.isDir);
        },
        [unsavedChanges, currentDitPath],
    );

    const handleRenameButtonClick = useCallback((file: FileMeta, e: React.MouseEvent<HTMLButtonElement>) => {}, []);

    return (
        <FilesCardBase
            files={files.data ?? []}
            path={files.path}
            onClickDir={handleClickDir}
            onClickToUpDir={handleClickToUpDir}
            fantomFiles={currendDirFantomFiles}
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
                                {file.fantom?.action === 'delete' ? 'восстановить' : 'удалить'}
                            </button>
                        </>
                    )}
                    <a
                        href={getDownloadLink(repository.data?.id ?? 0, file.pathToFile.join('~'))}
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
