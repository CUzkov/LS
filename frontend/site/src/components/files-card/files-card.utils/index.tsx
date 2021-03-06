import React, { ReactNode } from 'react';

import { FileMeta } from 'types';

import NoneIcon from 'file-icon-vectors/dist/icons/vivid/blank.svg';

import { extensionToIconMap, mapFantomActionToChar } from '../files-card.constants';

export const getIconByExtension = (name: string): ReactNode => {
    const splitName = name.split('.');
    const ext = splitName?.[splitName.length - 1];

    if (!ext || !extensionToIconMap[ext]) {
        return <NoneIcon />;
    }

    return extensionToIconMap[ext];
};

export const getCharsForFantomActions = (file: FileMeta) => mapFantomActionToChar[file.status];
