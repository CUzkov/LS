import { ReactNode } from 'react';

import { PopupButtons } from '../Popup/Popup.types';

export type Popup = {
    id: string;
    content: ReactNode;
    title: string;
    priority: number;
    isRequired: boolean;
    buttons: PopupButtons;
};

export interface IAddPopup {
    id: string;
    title: string;
    content: ReactNode;
    isRequired: boolean;
    buttons: PopupButtons;
}

export type MovablePopupManagerContext = {
    addPopup: ({}: IAddPopup) => void;
    removePopup: (id: string) => void;
};
