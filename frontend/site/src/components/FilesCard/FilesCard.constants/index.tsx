import React from 'react';

import DocIcon from 'file-icon-vectors/dist/icons/vivid/doc.svg';
import DocxIcon from 'file-icon-vectors/dist/icons/vivid/docx.svg';
import PdfIcon from 'file-icon-vectors/dist/icons/vivid/pdf.svg';
import XlsxIcon from 'file-icon-vectors/dist/icons/vivid/xlsx.svg';
import CppIcon from 'file-icon-vectors/dist/icons/vivid/cpp.svg';
import DbIcon from 'file-icon-vectors/dist/icons/vivid/db.svg';
import HIcon from 'file-icon-vectors/dist/icons/vivid/h.svg';

import { cn } from 'utils/classname';

import { Extensions } from '../FilesCard.typings';

export const cnFilesCard = cn('files-card')();
export const cnFileRow = cn('files-card', 'row')();
export const cnFileIcon = cn('files-card', 'icon')();
export const cnFileTitle = cn('files-card', 'title')();
export const cnFileActions = cn('files-card', 'actions');
export const cnFileActionIcon = cn('files-card', 'action-icon')();
export const cnEmptyMessage = cn('files-card', 'empty-message')();

export const extensionToIconMap = {
    [Extensions.pdf]: <PdfIcon />,
    [Extensions.doc]: <DocIcon />,
    [Extensions.docx]: <DocxIcon />,
    [Extensions.xlsx]: <XlsxIcon />,
    [Extensions.cpp]: <CppIcon />,
    [Extensions.db]: <DbIcon />,
    [Extensions.h]: <HIcon />,
};
