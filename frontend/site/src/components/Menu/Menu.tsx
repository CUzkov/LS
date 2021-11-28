import React, { Fragment, useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';

import { cnMenu, cnMenuItem, cnMenuDivider } from './Menu.constants';
import { MenuItem } from './MenuItem';
import { getMenu } from './Menu.constants';

import './style.scss';
import { useSelector } from 'store/store';

export const Menu: FC = () => {
    const { username } = useSelector((root) => root.user);
    const menuItems = useMemo(() => {
        return getMenu(username);
    }, [username]);

    const [isExpandMap, setIsExpandMap] = useState<boolean[]>(menuItems.map(() => false));

    const toggleMenuItem = useCallback(
        (index: number, isEmpty: boolean) => () => {
            setIsExpandMap((prev) => prev.map((isExpand, i) => (index === i ? !isExpand && !isEmpty : false)));
        },
        [],
    );

    return (
        <div className={cnMenu}>
            <div className={cnMenuDivider} />
            {menuItems.map((item, index) => (
                <Fragment key={index}>
                    <div className={cnMenuItem}>
                        <MenuItem
                            {...item}
                            isExpand={isExpandMap[index]}
                            onClickTitle={toggleMenuItem(index, item.links.length === 0)}
                        />
                    </div>
                    <div className={cnMenuDivider} />
                </Fragment>
            ))}
        </div>
    );
};
