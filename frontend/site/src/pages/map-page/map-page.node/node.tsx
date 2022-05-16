import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { Handle, Position, NodeProps } from 'react-flow-renderer';
import cn from 'classnames';

import { RWA } from 'types';
import { Badge, BadgeColors } from 'components/badge';

import EnterIcon from '../map-page.assets/enter.svg';

import styles from './styles.scss';
import './styles.css';

export const NODE_WIDTH = 250;

export type NodeData = {
    id: number;
    title: string;
    access: RWA;
    liknTo: string;
    badges?: { title: string; color: BadgeColors }[];
    noNeedEnter?: boolean;
    noNeedTopConnector?: boolean;
    noNeedBottomConnector?: boolean;
};

export const Node: FC<NodeProps<NodeData>> = ({ data }) => {
    return (
        <>
            <Handle type="target" position={Position.Top} className={cn(data.noNeedTopConnector && styles.hidden)} />
            <div className={styles.node} style={{ width: `${NODE_WIDTH}px` }}>
                <div className={styles.header}>{data.title}</div>
                <div className={styles.metainfo}>
                    <div className={styles.badges}>
                        {data.badges && data.badges.map((badge, i) => <Badge {...badge} isInMapNode key={i} />)}
                    </div>
                    {!data.noNeedEnter && data.access !== RWA.none && (
                        <Link to={data.liknTo} className={styles.enterIcon}>
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
