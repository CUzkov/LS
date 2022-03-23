import { MovablePopupManagerContext } from 'components/MovablePopupManager/MovablePopup.types';

let ids = 0;

export const yesNoPopup = (context: MovablePopupManagerContext, title: string, text: string, isRequired: boolean) => {
    const id = String(++ids);
    return new Promise<boolean>((resolve) => {
        context.addPopup({
            id,
            content: text,
            isRequired,
            title,
            buttons: [
                {
                    text: 'нет',
                    action: () => {
                        resolve(false);
                        context.removePopup(id);
                    },
                },
                {
                    text: 'да',
                    action: () => {
                        resolve(true);
                        context.removePopup(id);
                    },
                },
            ],
        });
    });
};
