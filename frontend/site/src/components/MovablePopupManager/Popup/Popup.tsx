import React, { ReactNode, RefObject, useCallback, useEffect, useState } from 'react';
import type { FC } from 'react';

import { useBooleanState, useOutsideClick } from 'hooks';

import styles from './style.scss';

interface IMovablePopupProps {
    children: ReactNode;
    title: string;
    zIndex: number;
    innerRef: RefObject<HTMLDivElement>;
    onMouseDown: () => void;
    onMouseMove: (mouseX: number, mouseY: number, e: MouseEvent) => void;
}

export const Popup: FC<IMovablePopupProps> = ({ children, title, innerRef, zIndex, onMouseMove, onMouseDown }) => {
    const [isTakePopup, takePopup, releasePopup] = useBooleanState(false);
    const [mousePositions, setMousePosition] = useState({ x: 0, y: 0 });
    const [popupLastPosition, setPopuplastPosotion] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            setMousePosition({
                y: e.clientX - (innerRef.current?.offsetLeft ?? 0),
                x: e.clientY - (innerRef.current?.offsetTop ?? 0),
            });
            takePopup();
            onMouseDown();
        },
        [innerRef],
    );

    const handleMouseUp = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        releasePopup();
        setPopuplastPosotion({
            x: innerRef.current?.offsetLeft ?? 0,
            y: innerRef.current?.offsetTop ?? 0
        });
    }, [innerRef]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => onMouseMove(mousePositions.x, mousePositions.y, e);

        if (isTakePopup) {
            window.addEventListener('mousemove', handleMouseMove);
        }

        return () => {
            if (isTakePopup) {
                window.removeEventListener('mousemove', handleMouseMove);
            }
        };
    }, [isTakePopup, onMouseMove, mousePositions]);

    const handleClickOutside = useCallback(() => {

    }, []);

    useOutsideClick(innerRef, handleClickOutside);

    return (
        <div
            className={styles.popup}
            ref={innerRef}
            style={{
                top: innerRef?.current?.style?.top ?? popupLastPosition.y,
                left: innerRef?.current?.style?.left ?? popupLastPosition.x,
                zIndex
            }}
        >
            <div className={styles.header} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                {title}
            </div>
            <div className={styles.content}>{children}</div>
        </div>
    );
};
