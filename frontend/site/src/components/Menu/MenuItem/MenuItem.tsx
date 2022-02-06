import React, { ReactElement } from 'react';
import { Link } from 'react-router-dom';
import type { FC } from 'react';

import { cnMenuItem, cnMenuItemTitle, cnMenuItemList, cnMenuItemLink, cnMenuItemTitleIcon } from './MenuItem.constants';

import './style.scss';

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
        <div className={cnMenuItem({ expand: isExpand })} onClick={onClickTitle}>
            <div className={cnMenuItemTitle}>
                <div className={cnMenuItemTitleIcon}>{icon}</div>
                {title}
            </div>
            <div className={cnMenuItemList}>
                {links.map((link, index) => (
                    <Link to={link.url} key={index}>
                        <div key={index} className={cnMenuItemLink}>
                            {link.title}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};
