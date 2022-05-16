import React from 'react';
import type { FC } from 'react';
import cn from 'classnames';

import { RWA } from 'types';

import styles from './style.scss';

export const RWAtobadgeColor = (rwa: RWA): BadgeColors => {
    if (rwa === RWA.rwa) {
        return BadgeColors.green;
    }

    if (rwa === RWA.none) {
        return BadgeColors.red;
    }

    if (rwa === RWA.rw) {
        return BadgeColors.green;
    }

    if (rwa === RWA.r) {
        return BadgeColors.yellow;
    }

    return BadgeColors.white;
};

export enum BadgeColors {
    red = 'red',
    white = 'white',
    green = 'green',
    yellow = 'yellow',
}

type BadgeProps = {
    title: string;
    color: BadgeColors;
    isInMapNode?: boolean;
};

export const Badge: FC<BadgeProps> = ({ title, color, isInMapNode }) => {
    return (
        <div
            className={cn(
                styles.badge,
                color === BadgeColors.white && styles.white,
                color === BadgeColors.red && styles.red,
                color === BadgeColors.green && styles.green,
                color === BadgeColors.yellow && styles.yellow,
                isInMapNode && styles.small,
            )}
        >
            {title}
            <div className={styles.bg} />
        </div>
    );
};
