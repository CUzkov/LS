import React from 'react';

import DocIcon from 'file-icon-vectors/dist/icons/vivid/doc.svg';
import DocxIcon from 'file-icon-vectors/dist/icons/vivid/docx.svg';
import PdfIcon from 'file-icon-vectors/dist/icons/vivid/pdf.svg';
import XlsxIcon from 'file-icon-vectors/dist/icons/vivid/xlsx.svg';
import CppIcon from 'file-icon-vectors/dist/icons/vivid/cpp.svg';
import DbIcon from 'file-icon-vectors/dist/icons/vivid/db.svg';
import HIcon from 'file-icon-vectors/dist/icons/vivid/h.svg';
import PngIcon from 'file-icon-vectors/dist/icons/vivid/png.svg';

import { Extensions } from '../FilesCard.typings';

export const extensionToIconMap = {
    [Extensions.pdf]: <PdfIcon />,
    [Extensions.doc]: <DocIcon />,
    [Extensions.docx]: <DocxIcon />,
    [Extensions.xlsx]: <XlsxIcon />,
    [Extensions.cpp]: <CppIcon />,
    [Extensions.db]: <DbIcon />,
    [Extensions.h]: <HIcon />,
    [Extensions.png]: <PngIcon />,
};
