import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import cn from 'classnames';

import { getMap } from 'constants/routers';
import { useSelector } from 'store';
import { RWA } from 'types';

import EnterIcon from '../map-page.assets/enter.svg';

import styles from './styles.scss';
import './styles.css';

export const MAP_NODE_WIDTH = 200;

export type MapNodeData = {
    id: number;
    title: string;
    access: RWA;
    noNeedEnter?: boolean;
    noNeedTopConnector?: boolean;
    noNeedBottomConnector?: boolean;
};

export const MapNode: FC<NodeProps<MapNodeData>> = ({ data }) => {
    const { username } = useSelector((root) => root.user);

    return (
        <>
            <Handle type="target" position={Position.Top} className={cn(data.noNeedTopConnector && styles.hidden)} />
            <div className={styles.mapNode} style={{ width: `${MAP_NODE_WIDTH}px` }}>
                <div className={styles.header}>
                    {data.title}
                    {!data.noNeedEnter && data.access !== RWA.none && (
                        <Link to={getMap(username, data.id)} className={styles.enterIcon}>
                            <EnterIcon />
                        </Link>
                    )}
                </div>
            </div>
            <Handle
                type="source"
                position={Position.Bottom}
                className={cn(data.noNeedBottomConnector && styles.hidden)}
            />
        </>
    );
};
