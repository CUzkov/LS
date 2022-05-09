import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { FC } from 'react';
import cn from 'classnames';

import styles from './style.scss';

interface IMenuItemProps {
    title: string;
    icon: ReactElement;
    links: {
        url: string;
        title: string;
    }[];
    isExpand: boolean;
    onClickTitle: () => void;
}

export const MenuItem: FC<IMenuItemProps> = ({ title, icon, links, isExpand, onClickTitle }) => {
    return (
        <div className={cn(styles.menuItem, isExpand && styles.expand)} onClick={onClickTitle}>
            <div className={styles.title}>
                <div className={styles.titleIcon}>{icon}</div>
                {title}
            </div>
            <div className={styles.list}>
                {links.map((link, index) => (
                    <Link to={link.url} key={index}>
                        <div key={index} className={styles.link}>
                            {link.title}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
