import React, { ReactNode, useCallback, useMemo, useState } from 'react';
import ReactDom from 'react-dom';
import type { FC } from 'react';

import { Popup } from './Popup';

import styles from './style.scss';

export const MovablePopupManagerContext = React.createContext({
    addPopup: (title: string, content: ReactNode) => {
        console.log();
    },
    removePopup: () => {
        console.log();
    },
});

type Popup = {
    content: ReactNode;
    title: string;
    priority: number;
    isRequired?: boolean;
};

interface IMovablePopupManagerProps {
    children: ReactNode;
}

export const MovablePopupManager: FC<IMovablePopupManagerProps> = ({ children }) => {
    const [popups, setPopups] = useState<Popup[]>([]);

    const createDivRef: () => React.RefObject<HTMLDivElement> = React.createRef;
    const popupsRefs = useMemo(() => popups.map(() => createDivRef()), [popups]);

    const handleAddPopup = useCallback((title: string, content: ReactNode) => {
        setPopups((prev) => prev.map((popup) => ({...popup, priority: popup.priority + 1})).concat([{
            title,
            content,
            priority: 1,
        }]));
    }, [popups]);

    const handleRemovePopup = useCallback(() => {}, []);

    const handleMouseDown = useCallback((index) => {
        const popupPriority = popups[index].priority;

        setPopups(prev => prev.map((popup, i) => {
            if (i === index) {
                return {...popup, priority: 1};
            }

            if (popup.priority < popupPriority) {
                return {...popup, priority: popup.priority + 1};
            }

            return popup;
        }))
    }, [popups]);

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
                <div className={styles.popupsLayout}>
                    {popups.map(({ content, title, priority }, index) => (
                        <Popup
                            title={title}
                            key={title + index}
                            innerRef={popupsRefs[index]}
                            onMouseMove={(mouseX: number, mouseY: number, e: MouseEvent) =>
                                handleMouseMove(index, mouseX, mouseY, e)
                            }
                            onMouseDown={() => handleMouseDown(index)}
                            zIndex={10000 - priority}
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
