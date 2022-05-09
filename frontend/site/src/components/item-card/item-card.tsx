import React, { FC } from 'react';
import { Link } from 'react-router-dom';

import styles from './style.scss';

type ItemCardProps = {
    title: string;
    link: string;
};

export const ItemCard: FC<ItemCardProps> = ({ title, link }) => {
    return (
        <div className={styles.itemCard}>
            <div>
                <Link to={link}>
                    <div className={styles.title}>{title}</div>
                </Link>
            </div>
        </div>
    );
};
