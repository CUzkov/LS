import React, { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import ReactDom from 'react-dom';
import cn from 'classnames';
import type { FC } from 'react';

import { noop } from 'utils/noop';

import { Popup } from './Popup';
import {
    IAddPopup,
    MovablePopupManagerContext as MovablePopupManagerContextType,
    Popup as PopupType,
} from './MovablePopup.types';

import styles from './style.scss';

const context: MovablePopupManagerContextType = {
    addPopup: noop,
    removePopup: noop,
};

export const MovablePopupManagerContext = React.createContext(context);

interface IMovablePopupManagerProps {
    children: ReactNode;
}

export const MovablePopupManager: FC<IMovablePopupManagerProps> = ({ children }) => {
    const [popups, setPopups] = useState<PopupType[]>([]);

    const createDivRef: () => React.RefObject<HTMLDivElement> = React.createRef;
    const popupsRefs = useMemo(() => popups.map(() => createDivRef()), [popups]);
    const isSomeRequired = useMemo(() => popups.some((popup) => popup.isRequired), [popups]);

    const handleAddPopup = useCallback(
        ({ id, title, content, isRequired }: IAddPopup) => {
            setPopups((prev) =>
                prev
                    .map((popup) => ({ ...popup, priority: popup.priority + 1 }))
                    .concat([
                        {
                            id,
                            title,
                            content,
                            priority: 1,
                            isRequired,
                        },
                    ]),
            );
        },
        [popups],
    );

    const handleRemovePopup = useCallback((id: string) => {
        setPopups((prev) => {
            let deletePopup: PopupType;

            const filterPopups = prev.filter((popup) => {
                if (popup.id === id) {
                    deletePopup = { ...popup };
                    return false;
                }

                return true;
            });

            return filterPopups.map((popup) => {
                if (popup.priority > deletePopup.priority) {
                    return { ...popup, priority: popup.priority - 1 };
                }

                return popup;
            });
        });
    }, []);

    const handleMouseDown = useCallback(
        (index) => {
            const popupPriority = popups[index].priority;

            setPopups((prev) =>
                prev.map((popup, i) => {
                    if (i === index) {
                        return { ...popup, priority: 1 };
                    }

                    if (popup.priority < popupPriority) {
                        return { ...popup, priority: popup.priority + 1 };
                    }

                    return popup;
                }),
            );
        },
        [popups],
    );

    const handleMouseMove = useCallback(
        (index: number, mouseX: number, mouseY: number, e: MouseEvent) => {
            const popup = popupsRefs[index];

            if (popup.current?.style) {
                popup.current.style.top = -mouseX + e.clientY + 'px';
                popup.current.style.left = -mouseY + e.clientX + 'px';
            }
        },
        [popupsRefs],
    );

    useEffect(() => {
        if (isSomeRequired) {
            document.body.style.pointerEvents = 'none';
        }

        return () => {
            document.body.style.pointerEvents = '';
        };
    }, [isSomeRequired]);

    return (
        <>
            <MovablePopupManagerContext.Provider
                value={{
                    addPopup: handleAddPopup,
                    removePopup: handleRemovePopup,
                }}
            >
                {children}
            </MovablePopupManagerContext.Provider>
            {ReactDom.createPortal(
                <div className={cn(styles.popupsLayout)}>
                    {popups.map(({ content, title, priority, isRequired }, index) => (
                        <Popup
                            title={title}
                            key={title + index}
                            innerRef={popupsRefs[index]}
                            onMouseMove={(mouseX: number, mouseY: number, e: MouseEvent) =>
                                handleMouseMove(index, mouseX, mouseY, e)
                            }
                            onMouseDown={() => handleMouseDown(index)}
                            zIndex={10000 - priority}
                            isRequired={isRequired && priority === 1}
                            anotherRequired={isSomeRequired}
                        >
                            {content}
                        </Popup>
                    ))}
                </div>,
                document.body,
            )}
        </>
    );
};
