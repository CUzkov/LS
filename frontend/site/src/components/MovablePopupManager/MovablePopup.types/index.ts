import { ReactNode } from 'react';

export type Popup = {
    id: string;
    content: ReactNode;
    title: string;
    priority: number;
    isRequired: boolean;
};

export interface IAddPopup {
    id: string;
    title: string;
    content: ReactNode;
    isRequired: boolean;
}

export type MovablePopupManagerContext = {
    addPopup: (props: IAddPopup) => void;
    removePopup: (id: string) => void;
};
