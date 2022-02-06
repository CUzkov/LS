import React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { cnBreadcrumbs, cnBreadcrumbsItem, cnBreadcrumbsItemBox } from './Breadcrumbs.constants';

import './style.scss';

interface IBreadcrumbsProps {
    paths: {
        title: string;
        url: string;
    }[];
}

export const Breadcrumbs: FC<IBreadcrumbsProps> = ({ paths }) => {
    return (
        <div className={cnBreadcrumbs}>
            {paths.map((breadcrumb, index, all) => (
                <Link
                    key={index}
                    className={cnBreadcrumbsItem}
                    style={{ zIndex: all.length - index }}
                    to={breadcrumb.url}
                >
                    <span>{breadcrumb.title}</span>
                    <div className={cnBreadcrumbsItemBox} />
                </Link>
            ))}
        </div>
    );
};
