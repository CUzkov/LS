import React from 'react';
import type { FC } from 'react';
import { Link } from 'react-router-dom';

import { cnItemCard, cnItemCardLeft, cnItemCardRight, cnItemCardTitle } from './ItemCard.constants';

import './style.scss';

interface IItemCardProps {
    title: string;
    link: string;
}

export const ItemCard: FC<IItemCardProps> = ({ title, link }) => {
    return (
        <div className={cnItemCard}>
            <div className={cnItemCardLeft}>
                <Link to={link}>
                    <div className={cnItemCardTitle}>{title}</div>
                </Link>
            </div>
            <div className={cnItemCardRight}></div>
        </div>
    );
};
