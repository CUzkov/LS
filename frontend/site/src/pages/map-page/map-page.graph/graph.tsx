import React, { FC, useEffect, useMemo, useRef, useState } from "react";
import {Sigma} from "sigma";
import GraphCore from "graphology";

import styles from './styles.scss';

export const Graph: FC = () => {
    const graphRef = useRef<HTMLDivElement>(null);
    const graphWrapperRef = useRef<HTMLDivElement>(null);
    const graph = useMemo(() => new GraphCore(), []);
    const [graphHeight, setGraphHeight] = useState(0);

    useEffect(() => {
        graph.addNode("John", { x: 0, y: 1, size: 50, label: "John", color: "blue" });
        graph.addNode("Mary", { x: 1, y: 0, size: 30, label: "Mary", color: "red" });
        graph.addEdge("John", "Mary");

        const onResizeWindow = () => {
            setGraphHeight(graphWrapperRef.current?.clientHeight ?? 100)
        }

        onResizeWindow();

        window.addEventListener('resize', () => onResizeWindow());

        return () => window.removeEventListener('resize', onResizeWindow);
    }, []);

    useEffect(() => {
        let sigma: Sigma;

        if (graphRef.current && graphHeight) {
            sigma = new Sigma(graph, graphRef.current, {
                enableEdgeHoverEvents: 'debounce',
                enableEdgeClickEvents: true,
                labelColor: {
                    color: '#f1f3f4'
                },  
            });

            sigma.on('clickNode', (node) => {
                console.log(node)
            })
        }

        return () => {
            sigma?.kill();
        }
    }, [graphHeight])

    return (
        <div ref={graphWrapperRef} className={styles.ghraphWrapper}>
            <div ref={graphRef} style={{height: `${graphHeight}px`}} />
        </div>
    );
};