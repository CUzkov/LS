import React, { createRef, useCallback, useEffect, useMemo, useState } from 'react';
import type { FC } from 'react';

import { useDispatch } from 'store';
import { File } from 'types';
import { getDownloadLink } from 'utils/urls';

import {
    cnFilesCard,
    cnFileRow,
    cnFileIcon,
    cnFileTitle,
    cnFileActions,
    cnFileActionIcon,
} from './FilesCard.constants';
import { getIconByExtension } from './FilesCard.utils';
import DownloadIcon from './FilesCard.assets/download.svg';

import './style.scss';

interface FilesCardProps {
    files: File[];
    repositoryId: number;
}

export const FilesCard: FC<FilesCardProps> = ({ files, repositoryId }: FilesCardProps) => {
    const [isFileHoverMap, setIsFileHoverMap] = useState<boolean[]>([]);
    const createDivRef: () => React.RefObject<HTMLDivElement> = createRef;
    const rowsRefs = useMemo(() => files.map(() => createDivRef()), [files]);
    const dispatch = useDispatch();

    useEffect(() => {
        setIsFileHoverMap(files.map(() => false));
    }, [files]);

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

    return (
        <div className={cnFilesCard}>
            {files.map((file, index) => (
                <div
                    className={cnFileRow}
                    key={index}
                    ref={rowsRefs[index]}
                    onMouseOver={(e) => handleToggleHover(index, e)}
                    onMouseOut={(e) => handleToggleHover(index, e)}
                >
                    <div className={cnFileTitle}>
                        <div className={cnFileIcon}>{getIconByExtension(file.name, file.isDir)}</div>
                        {file.name}
                    </div>
                    <div className={cnFileActions({ hover: isFileHoverMap[index] })}>
                        <a
                            href={getDownloadLink(repositoryId, file.pathToFile)}
                            target="_blank"
                            download={file.isDir ? `${file.name}.zip` : file.name}
                        >
                            <div className={cnFileActionIcon}>
                                <DownloadIcon />
                            </div>
                        </a>
                    </div>
                </div>
            ))}
        </div>
    );
};
