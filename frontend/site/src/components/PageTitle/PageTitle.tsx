import React, { ReactNode } from 'react';
import type { FC } from 'react';

import { cnPageTitle, cnRightChild, cnText } from './PageTitle.constants';

import './style.scss';

interface PageTitleProps {
    title: ReactNode;
    rightChild?: ReactNode;
}

export const PageTitle: FC<PageTitleProps> = ({ title, rightChild }: PageTitleProps) => {
    return (
        <div className={cnPageTitle}>
            <div className={cnText}>{title}</div>
            {rightChild && <div className={cnRightChild}>{rightChild}</div>}
        </div>
    );
};
