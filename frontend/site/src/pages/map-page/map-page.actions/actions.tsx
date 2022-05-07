import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { MovablePopupManagerContext } from 'components/movable-popup-manager';

import PlusIcon from '../map-page.assets/plus.svg';
import { serachPopup } from '../map-page.search-popup';

import styles from './style.scss';

export const MapsPageActions: FC = () => {
    const context = useContext(MovablePopupManagerContext);

    const handleSearch = useCallback((value: string) => {
        console.log(value);
    }, []);

    const handleClickAddGroupToScreen = useCallback(async () => {
        const maps = await serachPopup(context, 'Начните вводить название карты:', handleSearch);
    }, []);

    return (
        <div className={styles.mapPageActions}>
            <div className={cn(styles.actionIcon)} onClick={handleClickAddGroupToScreen}>
                <PlusIcon />
                {'добавить карту'}
            </div>
        </div>
    );
};
