import { ajax, ContentType, AjaxType } from '../ajax';

import type { IServerError, Empty } from '../types';
import { Dispatch } from '../store';

const LOGIN_URL = '/api/maps/create';

export interface INewMapProps {
    title: string;
}

export const createMap = async (dispath: Dispatch, props: INewMapProps) => {
    dispath({ type: 'create-map-form/loading' });

    const response = await ajax<Empty | IServerError, INewMapProps>({
        type: AjaxType.post,
        contentType: ContentType.JSON,
        url: LOGIN_URL,
        data: props,
    }).catch(() => {
        dispath({ type: 'create-map-form/failed' });
        return;
    });

    if (!response) {
        return;
    }

    if ('title' in response) {
        dispath({ type: 'create-map-form/success' });
        dispath({
            type: 'logger/add-log',
            data: { title: 'Карта создана', description: 'Успешное создание новой карты знаний', type: 'success' },
        });
    } else {
        dispath({ type: 'create-map-form/failed' });
        dispath({
            type: 'logger/add-log',
            data: { title: response.error, description: response.description, type: 'error' },
        });
    }
};
