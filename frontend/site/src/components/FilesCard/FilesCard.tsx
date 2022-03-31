import React, { createRef, ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import type { FC } from 'react';

import { useDispatch } from 'store';
import { FileMeta, FileStatus } from 'types';
import SpinnerIcon from 'assets/spinner.svg';

import { getIconByExtension, getCharsForFantomActions } from './FilesCard.utils';

import styles from './style.scss';

interface FilesCardProps {
    files: FileMeta[];
    path: string[];
    isLoading: boolean;
    isLoaded: boolean;
    actions?: (file: FileMeta) => ReactNode;
    onClickDir: (pathToDir: string[], dirName: string) => void;
    onClickToUpDir: () => void;
}

export const FilesCard: FC<FilesCardProps> = ({
    files,
    path,
    isLoading,
    isLoaded,
    actions = () => <></>,
    onClickDir,
    onClickToUpDir,
}: FilesCardProps) => {
    const [isFileHoverMap, setIsFileHoverMap] = useState<boolean[]>([]);
    const createDivRef: () => React.RefObject<HTMLDivElement> = createRef;
    const rowsRefs = useMemo(() => files.map(() => createDivRef()), [files]);
    const dispatch = useDispatch();

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
        (pathToDir: string[], dirName: string) => {
            onClickDir(pathToDir, dirName);
            setIsFileHoverMap(files.map(() => false));
        },
        [dispatch],
    );

    useEffect(() => {
        setIsFileHoverMap(files.map(() => false));
    }, [files]);

    return (
        <div className={styles.filesCard}>
            {isLoaded && path.length ? (
                <div className={styles.row} onClick={() => onClickToUpDir()}>
                    <div className={styles.title}>{'...'}</div>
                </div>
            ) : null}
            {isLoaded &&
                files.map((file, index) => {
                    const rowTestStyle = cn(
                        file.status === FileStatus.add && styles.added,
                        file.status === FileStatus.modify && styles.modify,
                        file.status === FileStatus.delete && styles.delete,
                    );
                    return (
                        <div
                            className={cn(styles.row, rowTestStyle)}
                            key={file.name + index}
                            ref={rowsRefs[index]}
                            onMouseOver={(e) => handleToggleHover(index, e)}
                            onMouseOut={(e) => handleToggleHover(index, e)}
                            onClick={file.isDir ? () => handleClickDir(file.pathToFile, file.name) : undefined}
                        >
                            <div className={styles.title}>
                                <div className={styles.icon}>{getIconByExtension(file.name, file.isDir)}</div>
                                {file.name}
                            </div>
                            {/* <div
                            className={cn(
                                styles.actionChar,
                                file.actions.length !== 0 && styles.showActionChar,
                                rowTestStyle,
                            )}
                        >
                            {file.actions.length !== 0 && getCharsForFantomActions(file)}
                        </div> */}
                            {actions && (
                                <div className={cn(styles.actions, isFileHoverMap[index] && styles.hover)}>
                                    {actions(file)}
                                </div>
                            )}
                        </div>
                    );
                })}
            {isLoading && (
                <div className={styles.spinner}>
                    <SpinnerIcon />
                </div>
            )}
        </div>
    );
};
