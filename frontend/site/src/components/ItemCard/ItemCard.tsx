import React from 'react';
import type { FC } from 'react';

import { cnItemCard, cnItemCardLeft, cnItemCardRight, cnItemCardTitle } from './ItemCard.constants';

import './style.scss';

interface IItemCardProps {
    title: string;
    
}

export const ItemCard: FC<IItemCardProps> = ({ title }) => {
    return (
        <div className={cnItemCard}>
            <div className={cnItemCardLeft}>
                <div className={cnItemCardTitle}>{title}</div>
            </div>
            <div className={cnItemCardRight}></div>
        </div>
    );
};
