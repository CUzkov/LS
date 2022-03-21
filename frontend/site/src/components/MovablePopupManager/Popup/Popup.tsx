import React, { FC, ReactNode, RefObject, useCallback, useEffect, useState } from 'react';
import cn from 'classnames';

import { useBooleanState, useOutsideClick } from 'hooks';
import { Button } from 'small-components/Button';

import { PopupButtons } from './Popup.types';

import styles from './style.scss';

interface IMovablePopupProps {
    children: ReactNode;
    title: string;
    zIndex: number;
    innerRef: RefObject<HTMLDivElement>;
    isRequired: boolean;
    anotherRequired: boolean;
    buttons: PopupButtons;
    onMouseDown: () => void;
    onMouseMove: (mouseX: number, mouseY: number, e: MouseEvent) => void;
}

export const Popup: FC<IMovablePopupProps> = ({
    children,
    title,
    innerRef,
    zIndex,
    isRequired,
    anotherRequired,
    buttons,
    onMouseMove,
    onMouseDown,
}) => {
    const [isTakePopup, takePopup, releasePopup] = useBooleanState(false);
    const [mousePositions, setMousePosition] = useState({ x: 0, y: 0 });
    const [popupLastPosition, setPopuplastPosotion] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    const [isErrorAnimation, startErrorAnimation, stopErrorAnimation] = useBooleanState(false);
    const isCannotInteract = !isRequired && anotherRequired;

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
            setMousePosition({
                y: e.clientX - (innerRef.current?.offsetLeft ?? 0),
                x: e.clientY - (innerRef.current?.offsetTop ?? 0),
            });
            takePopup();
            onMouseDown();
        },
        [innerRef, isRequired, anotherRequired],
    );

    const handleMouseUp = useCallback(() => {
        releasePopup();
        setPopuplastPosotion({
            x: innerRef.current?.offsetLeft ?? 0,
            y: innerRef.current?.offsetTop ?? 0,
        });
    }, [innerRef, isRequired, anotherRequired]);

    const handleClickOutside = useCallback(() => {
        if (isRequired) {
            startErrorAnimation();
            // @FIXME доделать, что бы при спаме кликами было норм
            setTimeout(() => {
                stopErrorAnimation();
            }, 750);
        }
    }, [isRequired]);

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

    useOutsideClick(innerRef, handleClickOutside);

    return (
        <div
            className={cn(styles.popup, isErrorAnimation && styles.closeError, isCannotInteract && styles.noInteract)}
            ref={innerRef}
            style={{
                top: innerRef?.current?.style?.top ?? popupLastPosition.y,
                left: innerRef?.current?.style?.left ?? popupLastPosition.x,
                zIndex,
                pointerEvents: 'all'
            }}
        >
            <div className={styles.header} onMouseDown={handleMouseDown} onMouseUp={handleMouseUp}>
                {title}
            </div>
            <div className={styles.content}>{children}</div>
            <div className={styles.buttons}>
                {buttons.map(({ text, action }) => (
                    <div className={styles.button}>
                        <Button text={text} onClick={action} />
                    </div>
                ))}
            </div>
        </div>
    );
};
