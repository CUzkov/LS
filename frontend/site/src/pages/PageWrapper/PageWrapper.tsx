import React, { ReactElement } from 'react';
import type { FC } from 'react';

import { cnPageWrapper, cnPageWrapperMenu, cnPageWrapperContent, cnPageWrapperPage } from './PageWrapper.constants';
import { Menu } from 'components/Menu';
import { Breadcrumbs } from 'components/Breadcrumbs';

import './style.scss';

interface IPageWrapperProps {
    content: ReactElement;
    paths: {
        title: string;
        url: string;
    }[];
}

export const PageWrapper: FC<IPageWrapperProps> = ({ paths, content }) => {
    return (
        <div className={cnPageWrapper}>
            <Breadcrumbs paths={paths} />
            <div className={cnPageWrapperPage}>
                <div className={cnPageWrapperMenu}>
                    <Menu />
                </div>
                <div className={cnPageWrapperContent}>{content}</div>
            </div>
        </div>
    );
};
