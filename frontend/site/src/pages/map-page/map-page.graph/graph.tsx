import React, { FC, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, { Node, Edge, NodeChange, EdgeChange } from 'react-flow-renderer';

import { FullGroup, RWA } from 'types';
import { setEdges, setNodes, applyEdgeChanges, applyNodeChanges } from 'actions/map-page';
import { getMap, getRepository } from 'constants/routers';
import { BadgeColors, RWAtobadgeColor } from 'components/badge';
import { useSelector } from 'store';

import { NODE_WIDTH, Node as NodeComponent, NodeData } from '../map-page.node';
import { formatMapId, formatRepositoryId } from '../map-page.utils';

import styles from './styles.scss';
import './styles.css';

type GraphProps = {
    map?: FullGroup;
};

export const Graph: FC<GraphProps> = ({ map }) => {
    const graphWrapperRef = useRef<HTMLDivElement>(null);
    const nodeTypes = useMemo(() => ({ customNode: NodeComponent }), []);
    const { tree } = useSelector((root) => root.mapPage);
    const { username } = useSelector((root) => root.user);

    const onNodesChange = useCallback((changes: NodeChange[]) => applyNodeChanges(changes, tree.nodes), [tree.nodes]);
    const onEdgesChange = useCallback((changes: EdgeChange[]) => applyEdgeChanges(changes, tree.edges), [tree.edges]);

    useEffect(() => {
        if (!map) {
            return;
        }

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        const baseMapId = formatMapId(map.id);
        const baseMapProps: NodeData = {
            id: map.id,
            title: map.title,
            noNeedTopConnector: true,
            noNeedBottomConnector: !map.childrenGroups.length && !map.childrenRepositories.length,
            noNeedEnter: true,
            access: map.access,
            liknTo: '',
            badges: [
                { title: 'карта знаний', color: BadgeColors.white },
                { title: map.access === RWA.none ? 'no access' : map.access, color: RWAtobadgeColor(map.access) },
            ],
        };

        nodes.push({
            id: baseMapId,
            data: baseMapProps,
            type: 'customNode',
            position: { x: 0, y: 0 },
        });

        const MAPS_TO_REPOSITOPRIES_GAP = 60;
        const NODES_GAP = 20;
        const childNodesLength = map.childrenGroups.length + map.childrenRepositories.length;
        const childNodesWidth =
            childNodesLength * (NODE_WIDTH + NODES_GAP) +
            (map.childrenRepositories.length !== 0 ? MAPS_TO_REPOSITOPRIES_GAP : 0) -
            NODES_GAP;

        let currentOffset = -(childNodesWidth - NODE_WIDTH) / 2;

        map.childrenGroups.forEach((map) => {
            const id = formatMapId(map.id);
            const mapProps: NodeData = {
                id: map.id,
                title: map.title,
                noNeedBottomConnector: true,
                access: map.access,
                liknTo: getMap(username, map.id),
                badges: [
                    { title: 'карта знаний', color: BadgeColors.white },
                    { title: map.access === RWA.none ? 'no access' : map.access, color: RWAtobadgeColor(map.access) },
                ],
            };

            nodes.push({
                id,
                data: mapProps,
                type: 'customNode',
                position: { x: currentOffset, y: 100 },
            });

            edges.push({
                id: `${baseMapId}-${id}`,
                source: baseMapId,
                target: id,
            });

            currentOffset += NODE_WIDTH + NODES_GAP;
        });

        currentOffset += MAPS_TO_REPOSITOPRIES_GAP;

        map.childrenRepositories.forEach((repository) => {
            const id = formatRepositoryId(repository.id);
            const repositoryProps: NodeData = {
                id: repository.id,
                title: repository.title,
                noNeedBottomConnector: true,
                access: repository.access,
                liknTo: getRepository(username, repository.id),
                badges: [
                    { title: 'репозиторий', color: BadgeColors.white },
                    {
                        title: repository.access === RWA.none ? 'no access' : repository.access,
                        color: RWAtobadgeColor(repository.access),
                    },
                ],
            };

            nodes.push({
                id,
                data: repositoryProps,
                type: 'customNode',
                position: { x: currentOffset, y: 100 },
            });

            edges.push({
                id: `${baseMapId}-${id}`,
                source: baseMapId,
                target: id,
            });

            currentOffset += NODE_WIDTH + NODES_GAP;
        });

        setNodes(nodes);
        setEdges(edges);
    }, [map]);

    return (
        <div className={styles.ghraphWrapper} ref={graphWrapperRef}>
            <div
                style={{
                    height: `${graphWrapperRef.current?.clientHeight}px`,
                    width: `${graphWrapperRef.current?.clientWidth}px`,
                }}
            >
                <ReactFlow
                    nodes={tree.nodes}
                    edges={tree.edges}
                    fitView
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    nodeTypes={nodeTypes}
                />
            </div>
        </div>
    );
};
