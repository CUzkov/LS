import React, { FC, useCallback, useContext } from 'react';
import { Link } from 'react-router-dom';
import cn from 'classnames';

import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { addMapNodes, addRepositoryNodes } from 'actions/map-page';
import { useSelector } from 'store';

import PlusIcon from '../map-page.assets/plus.svg';
import SettingsIcon from '../map-page.assets/settings.svg';
import { mapSearchPopup, repositorySearchPopup } from '../map-page.search-popup';

import styles from './style.scss';
import { RWA } from 'types';
import { getMapSettings } from 'constants/routers';

export const MapsPageActions: FC = () => {
    const { map } = useSelector((root) => root.mapPage);
    const { username } = useSelector((root) => root.user);
    const context = useContext(MovablePopupManagerContext);
    const isCanEdit = map?.access === RWA.rw || map?.access === RWA.rwa;
    const isCanGiveAcces = map?.access === RWA.rwa;

    const handleClickAddMap = useCallback(async () => {
        const maps = await mapSearchPopup(context, 'Начните вводить название карты:');
        addMapNodes(maps);
    }, []);

    const handleClickAddRepository = useCallback(async () => {
        const repositories = await repositorySearchPopup(context, 'Начните вводить название репозитория:');
        addRepositoryNodes(repositories);
    }, []);

    return (
        <div className={styles.mapPageActions}>
            {isCanEdit && (
                <>
                    <div className={cn(styles.actionIcon)} onClick={handleClickAddRepository}>
                        <PlusIcon />
                        {'добавить репозиторий(-ии)'}
                    </div>
                    <div className={cn(styles.actionIcon)} onClick={handleClickAddMap}>
                        <PlusIcon />
                        {'добавить карту(-ы)'}
                    </div>
                </>
            )}
            {isCanGiveAcces && (
                <Link className={cn(styles.actionIcon)} to={getMapSettings(username, map.id)}>
                    <SettingsIcon />
                    {'настройки'}
                </Link>
            )}
        </div>
    );
};
