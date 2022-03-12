import React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import styles from './style.scss';

interface IItemCardProps {
    title: string;
    link: string;
}

export const ItemCard: FC<IItemCardProps> = ({ title, link }) => {
    return (
        <div className={styles.itemCard}>
            <div>
                <Link to={link}>
                    <div className={styles.title}>{title}</div>
                </Link>
            </div>
            <div></div>
        </div>
    );
};
