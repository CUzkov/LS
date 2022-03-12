import React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import styles from './style.scss';

interface IBreadcrumbsProps {
    paths: {
        title: string;
        url: string;
    }[];
}

export const Breadcrumbs: FC<IBreadcrumbsProps> = ({ paths }) => {
    return (
        <div className={styles.breadcrumbs}>
            {paths.map((breadcrumb, index, all) => (
                <Link key={index} className={styles.item} style={{ zIndex: all.length - index }} to={breadcrumb.url}>
                    <span>{breadcrumb.title}</span>
                    <div className={styles.itemBox} />
                </Link>
            ))}
        </div>
    );
};
