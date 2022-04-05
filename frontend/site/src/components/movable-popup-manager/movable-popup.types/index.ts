import { ReactNode } from 'react';

export type Popup = {
    id: string;
    content: ReactNode;
    title: ReactNode;
    priority: number;
    isRequired: boolean;
};

export interface IAddPopup {
    id: string;
    title: ReactNode;
    content: ReactNode;
    isRequired: boolean;
}

export type MovablePopupManagerContext = {
    addPopup: (props: IAddPopup) => void;
    removePopup: (id: string) => void;
};
