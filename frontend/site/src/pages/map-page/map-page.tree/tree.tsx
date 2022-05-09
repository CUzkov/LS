import React, { FC, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import ReactFlow, { applyEdgeChanges, applyNodeChanges, Node, Edge } from 'react-flow-renderer';

import { FullGroup } from 'types';

import styles from './styles.scss';
import './styles.css';

const fullGroupToDrawTree = (group: FullGroup, tree: DrawTree, depth = 0): DrawTree => {
    group.children?.forEach((child, i) => {
        if (tree) {
            tree.children.push(new DrawTree(tree, depth + 1, child.id, child.parentId, child.title));
            fullGroupToDrawTree(child, tree.children[i], depth + 1);
        }
    });

    return tree;
};

// Алгоритм из секции The Mods and the Rockers доработанный для наших исходных данных
// https://llimllib.github.io/pymag-trees/
class DrawTree {
    x: number;
    y: number;
    id: number;
    parentId: number;
    title: ReactNode;

    tree: DrawTree | null;
    mod: number;
    children: DrawTree[];

    constructor(tree: DrawTree | null, depth: number, id: number, parentId: number, title: ReactNode) {
        this.tree = tree;
        this.y = depth;
        this.x = 0;
        this.children = [];
        this.id = id;
        this.parentId = parentId;
        this.title = title;
    }

    moveBranch(branch: DrawTree, n: number) {
        branch.x += n;
        branch.children.forEach((child) => this.moveBranch(child, n));
    }

    setup(tree: DrawTree, depth = 0, nexts = {}, offset = {}) {
        let place = 0,
            s = 0;

        tree.children.forEach((child) => this.setup(child, depth + 1, nexts, offset));

        tree.y = depth;

        if (!tree.children.length) {
            place = nexts[depth] ?? 0;
            tree.x = place;
        } else if (tree.children.length === 1) {
            place = tree.children[0].x - 1;
        } else {
            s = tree.children[0].x + tree.children[1].x;
            place = s / 2;
        }

        offset[depth] = Math.max(offset[depth] ?? 0, (nexts[depth] ?? 0) - place);

        if (tree.children.length) {
            tree.x = place + offset[depth];
        }

        nexts[depth] ? (nexts[depth] += 2) : (nexts[depth] = 2);
        tree.mod = offset[depth] ?? 0;
    }

    addmods(tree: DrawTree, modsum = 0) {
        tree.x = tree.x + modsum;
        modsum += tree.mod;
        tree.children.forEach((child) => this.addmods(child, modsum));
    }

    layout(tree: DrawTree) {
        this.setup(tree);
        this.addmods(tree);
    }
}

type GraphProps = {
    group?: FullGroup;
};

export const Tree: FC<GraphProps> = ({ group }) => {
    const graphWrapperRef = useRef<HTMLDivElement>(null);
    const [nodes, setNodes] = useState<Node[]>([]);
    const [edges, setEdges] = useState<Edge[]>([]);

    const onNodesChange = useCallback((changes) => setNodes((nds) => applyNodeChanges(changes, nds)), [setNodes]);
    const onEdgesChange = useCallback((changes) => setEdges((eds) => applyEdgeChanges(changes, eds)), [setEdges]);

    useEffect(() => {
        if (!group) {
            return;
        }

        const nodes: Node[] = [];
        const edges: Edge[] = [];

        const tree = fullGroupToDrawTree(group, new DrawTree(null, 0, group.id, group.parentId, group.title));
        tree.layout(tree);

        const drawTreeToNodesAndEdges = (tree: DrawTree) => {
            nodes.push({
                id: String(tree.id),
                data: { label: <div>{tree.title}</div> },
                position: { x: tree.x * 100, y: tree.y * 100 },
            });

            tree.children.forEach((child) => {
                edges.push({
                    id: `${child.id}-${child.parentId}`,
                    source: String(child.parentId),
                    target: String(child.id),
                });

                drawTreeToNodesAndEdges(child);
            });
        };

        drawTreeToNodesAndEdges(tree);

        setNodes(nodes);
        setEdges(edges);
    }, [group]);

    return (
        <div className={styles.ghraphWrapper} ref={graphWrapperRef}>
            <div
                style={{
                    height: `${graphWrapperRef.current?.clientHeight}px`,
                    width: `${graphWrapperRef.current?.clientWidth}px`,
                }}
            >
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    fitView
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                />
            </div>
        </div>
    );
};
