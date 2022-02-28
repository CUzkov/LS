import React, { ReactNode } from 'react';

import DirIcon from 'file-icon-vectors/dist/icons/vivid/folder.svg';
import NoneIcon from 'file-icon-vectors/dist/icons/vivid/blank.svg';

import { extensionToIconMap } from '../FilesCard.constants';

export const getIconByExtension = (name: string, isDir = false): ReactNode => {
    if (isDir) {
        return <DirIcon />;
    }

    const splitName = name.split('.');
    const ext = splitName?.[splitName.length - 1];

    if (!ext || !extensionToIconMap[ext]) {
        return <NoneIcon />;
    }

    return extensionToIconMap[ext];
};
