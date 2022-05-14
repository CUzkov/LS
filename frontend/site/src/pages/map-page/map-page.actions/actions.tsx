import React, { FC, useCallback, useContext } from 'react';
import cn from 'classnames';

import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { addMapNodes } from 'actions/map-page';

import PlusIcon from '../map-page.assets/plus.svg';
import { mapSearchPopup, repositorySearchPopup } from '../map-page.search-popup';

import styles from './style.scss';

export const MapsPageActions: FC = () => {
    const context = useContext(MovablePopupManagerContext);

    const handleClickAddMap = useCallback(async () => {
        const maps = await mapSearchPopup(context, 'Начните вводить название карты:');
        addMapNodes(maps);
    }, []);

    const handleClickAddRepository = useCallback(async () => {
        const repositories = await repositorySearchPopup(context, 'Начните вводить название репозитория:');
        // addNodes(repositories);
    }, []);

    return (
        <div className={styles.mapPageActions}>
            <div className={cn(styles.actionIcon)} onClick={handleClickAddRepository}>
                <PlusIcon />
                {'добавить репозиторий(-ии)'}
            </div>
            <div className={cn(styles.actionIcon)} onClick={handleClickAddMap}>
                <PlusIcon />
                {'добавить карту(-ы)'}
            </div>
        </div>
    );
};
