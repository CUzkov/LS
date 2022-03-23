import React, { createRef, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import type { FC } from 'react';

import { useDispatch } from 'store';
import { FileMeta } from 'types';

import { getIconByExtension, sortFiles } from './FilesCard.utils';

import styles from './style.scss';

interface FilesCardProps {
    files: Array<FileMeta>;
    path: string[];
    fantomFiles?: Array<FileMeta>;
    actions?: (file: FileMeta) => ReactNode;
    onClickDir: (pathToDir: string[]) => void;
    onClickToUpDir: () => void;
}

export const FilesCard: FC<FilesCardProps> = ({
    files,
    path,
    fantomFiles = [],
    actions = () => <></>,
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
                    if (
                        !file.fantom &&
                        fantomFiles.some(
                            (fantomFile) => fantomFile.isDir === file.isDir && fantomFile.name === file.name,
                        )
                    ) {
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
            {filesToShow.map((file, index) => (
                <div
                    className={cn(
                        styles.row,
                        file.fantom?.action === 'add' && styles.added,
                        file.fantom?.action === 'rewrite' && styles.rewrite,
                        file.fantom?.action === 'delete' && styles.delete,
                    )}
                    key={file.name + index}
                    ref={rowsRefs[index]}
                    onMouseOver={(e) => handleToggleHover(index, e)}
                    onMouseOut={(e) => handleToggleHover(index, e)}
                    onClick={
                        file.isDir && file.fantom?.action !== 'delete'
                            ? () => handleClickDir(file.pathToFile)
                            : undefined
                    }
                >
                    <div className={styles.title}>
                        <div className={styles.icon}>{getIconByExtension(file.name, file.isDir)}</div>
                        {file.name}
                    </div>
                    {actions && (
                        <div className={cn(styles.actions, isFileHoverMap[index] && styles.hover)}>{actions(file)}</div>
                    )}
                </div>
            ))}
            {files.length === 0 && <div className={styles.emptyMessage}>{'Репозиторий пуст'}</div>}
        </div>
    );
};
