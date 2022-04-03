import React, { ReactNode, useCallback, useRef } from 'react';
import cn from 'classnames';
import DirIcon from 'file-icon-vectors/dist/icons/vivid/folder.svg';
import type { FC } from 'react';

import { useDispatch } from 'store';
import { DirMeta, DirStatus, FileMeta, FileStatus } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { useBooleanState } from 'hooks';

import { getIconByExtension, getCharsForFantomActions } from './FilesCard.utils';

import styles from './style.scss';

type RowProps = {
    title: string;
    icon: ReactNode;
    statusChar?: string;
    actions: ReactNode;
    className?: string;
    onClick?: () => void;
};

const Row = ({ title, className, icon, statusChar, actions, onClick }: RowProps) => {
    const [isHover, , , toggleHover] = useBooleanState(false);
    const rowRef = useRef<HTMLDivElement>(null);

    const handleToggleHoverFile = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            const isNoNeedChangeHover = isHover && rowRef.current?.contains(e.relatedTarget as Element);

            if (!isNoNeedChangeHover) {
                toggleHover();
            }
        },
        [rowRef, isHover],
    );

    return (
        <div
            className={cn(styles.row, className)}
            onClick={onClick}
            ref={rowRef}
            onMouseOver={handleToggleHoverFile}
            onMouseOut={handleToggleHoverFile}
        >
            <div className={styles.title}>
                <div className={styles.icon}>{icon}</div>
                {title}
            </div>
            <div className={cn(styles.actionChar, statusChar && styles.showActionChar)}>{statusChar}</div>
            {actions && <div className={cn(styles.actions, isHover && styles.hover)}>{actions}</div>}
        </div>
    );
};

interface FilesCardProps {
    files: FileMeta[];
    dirs: DirMeta[];
    path: string[];
    isLoading: boolean;
    isLoaded: boolean;
    actionsForFiles: (file: FileMeta) => ReactNode;
    actionsForDirs: (file: DirMeta) => ReactNode;
    onClickDir: (pathToDir: string[], dirName: string) => void;
    onClickToUpDir: () => void;
}

export const FilesCard: FC<FilesCardProps> = ({
    files,
    dirs,
    path,
    isLoading,
    isLoaded,
    actionsForFiles = () => <></>,
    actionsForDirs = () => <></>,
    onClickDir,
    onClickToUpDir,
}: FilesCardProps) => {
    const dispatch = useDispatch();

    const handleClickDir = useCallback(
        (pathToDir: string[], dirName: string) => {
            onClickDir(pathToDir, dirName);
        },
        [dispatch],
    );

    return (
        <div className={styles.filesCard}>
            {isLoaded && path.length ? (
                <div className={styles.row} onClick={() => onClickToUpDir()}>
                    <div className={styles.title}>{'...'}</div>
                </div>
            ) : null}
            {isLoaded && (
                <>
                    {dirs.map((dir, index) => (
                        <Row
                            title={dir.name}
                            key={dir.name + index}
                            icon={<DirIcon />}
                            onClick={() => handleClickDir(dir.pathToDir, dir.name)}
                            className={cn(
                                styles.dir,
                                dir.status === DirStatus.addOrRename && styles.addOrRename,
                                dir.status === DirStatus.delete && styles.delete,
                                dir.status === DirStatus.modify && styles.modify,
                            )}
                            actions={actionsForDirs(dir)}
                        />
                    ))}
                    {files.map((file, index) => (
                        <Row
                            title={file.name}
                            key={file.name + index}
                            icon={getIconByExtension(file.name)}
                            className={cn(
                                styles.file,
                                file.status === FileStatus.add && styles.added,
                                file.status === FileStatus.modify && styles.modify,
                                file.status === FileStatus.rename && styles.rename,
                                file.status === FileStatus.delete && styles.delete,
                            )}
                            statusChar={getCharsForFantomActions(file)}
                            actions={actionsForFiles(file)}
                        />
                    ))}
                </>
            )}
            {isLoading && (
                <div className={styles.spinner}>
                    <SpinnerIcon />
                </div>
            )}
        </div>
    );
};
