import React, { Fragment, useCallback, useMemo, useState } from 'react';
import type { FC } from 'react';

import { useSelector } from 'store/store';

import { MenuItem } from './MenuItem';
import { getMenu } from './Menu.constants';

import styles from './style.scss';

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
        <div>
            <div className={styles.divider} />
            {menuItems.map((item, index) => (
                <Fragment key={index}>
                    <MenuItem
                        {...item}
                        isExpand={isExpandMap[index]}
                        onClickTitle={toggleMenuItem(index, item.links.length === 0)}
                    />
                    <div className={styles.divider} />
                </Fragment>
            ))}
        </div>
    );
};
