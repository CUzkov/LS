import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import type { FC } from 'react';

import { useDispatch } from 'store';
import { FileMeta } from 'types';
import { getDownloadLink } from 'utils/urls';

import { getIconByExtension, sortFiles } from './FilesCard.utils';
import DownloadIcon from './FilesCard.assets/download.svg';

import styles from './style.scss';

interface FilesCardProps {
    files: Array<FileMeta & { fantomKey?: string }>;
    repositoryId: number;
    path: string[];
    isEditing?: boolean;
    fantomFiles?: Array<FileMeta & { fantomKey: string }>;
    onClickAddFile: () => void;
    onClickDir: (pathToDir: string[]) => void;
    onClickToUpDir: () => void;
}

export const FilesCard: FC<FilesCardProps> = ({
    files,
    repositoryId,
    path,
    fantomFiles = [],
    isEditing = false,
    onClickAddFile,
    onClickDir,
    onClickToUpDir,
}: FilesCardProps) => {
    const [isFileHoverMap, setIsFileHoverMap] = useState<boolean[]>([]);
    const createDivRef: () => React.RefObject<HTMLDivElement> = createRef;
    const rowsRefs = useMemo(() => files.concat(fantomFiles).map(() => createDivRef()), [files, fantomFiles]);
    const dispatch = useDispatch();

    const filesToShow = useMemo(
        () =>
            files
                .concat(fantomFiles)
                .sort(sortFiles)
                .filter((file) => {
                    if (!file.fantom && fantomFiles.some((fantomFile) => fantomFile.name === file.name)) {
                        return false;
                    }

                    return true;
                }),
        [files, fantomFiles],
    );

    const handleToggleHover = useCallback(
        (index: number, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const isHover = isFileHoverMap[index];
            const row = rowsRefs[index];
            const isNoNeedChangeHover = isHover && row.current?.contains(e.relatedTarget as Element);

            if (!isNoNeedChangeHover) {
                const newHoverMap = [...isFileHoverMap];
                newHoverMap[index] = !isHover;
                setIsFileHoverMap(newHoverMap);
            }
        },
        [isFileHoverMap, rowsRefs],
    );

    const handleClickDir = useCallback(
        (pathToDir: string[]) => {
            onClickDir(pathToDir);
            setIsFileHoverMap(files.map(() => false));
        },
        [dispatch],
    );

    useEffect(() => {
        setIsFileHoverMap(files.map(() => false));
    }, [files]);

    return (
        <div className={styles.filesCard}>
            {path.length ? (
                <div className={styles.row} onClick={() => onClickToUpDir()}>
                    <div className={styles.title}>{'...'}</div>
                </div>
            ) : null}
            {isEditing ? (
                <>
                    <div className={styles.row} onClick={onClickAddFile}>
                        <div className={styles.title}>{'+ добавить файл'}</div>
                    </div>
                    <div className={styles.row}>
                        <div className={styles.title}>{'+ добавить папку'}</div>
                    </div>
                </>
            ) : null}
            {filesToShow.map((file, index) => (
                <div
                    className={cn(
                        styles.row,
                        file.fantom?.action === 'add' && styles.added,
                        file.fantom?.action === 'rewrite' && styles.rewrite,
                    )}
                    key={file.name + index}
                    ref={rowsRefs[index]}
                    onMouseOver={(e) => handleToggleHover(index, e)}
                    onMouseOut={(e) => handleToggleHover(index, e)}
                    onClick={file.isDir ? () => handleClickDir(file.pathToFile) : undefined}
                >
                    <div className={styles.title}>
                        <div className={styles.icon}>{getIconByExtension(file.name, file.isDir)}</div>
                        {file.name}
                    </div>
                    <div className={cn(styles.actions, isFileHoverMap[index] && styles.hover)}>
                        <a
                            href={getDownloadLink(repositoryId, file.pathToFile.join('~'))}
                            target="_blank"
                            download={file.isDir ? `${file.name}.zip` : file.name}
                        >
                            <div className={styles.actionIcon}>
                                <DownloadIcon />
                            </div>
                        </a>
                    </div>
                </div>
            ))}
            {files.length === 0 && <div className={styles.emptyMessage}>{'Репозиторий пуст'}</div>}
        </div>
    );
};
