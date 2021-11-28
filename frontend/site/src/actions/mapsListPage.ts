import { ajax, ContentType, AjaxType } from '../ajax';
import type { IServerError, Map, Empty } from '../types';
import type { Dispatch } from '../store';

const MAPS_LIST_PAGE_ALL_MAPS = '/api/maps/all/my';

export const getMapsListPageAllMaps = async (dispath: Dispatch) => {
    dispath({ type: 'maps-list-page/maps-list/loading' });

    const response = await ajax<Map[] | IServerError, Empty>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: MAPS_LIST_PAGE_ALL_MAPS,
    }).catch(() => {
        dispath({ type: 'maps-list-page/maps-list/error' });
        return {
            error: 'unknouw error',
        };
    });

    if ('error' in response) {
        dispath({ type: 'maps-list-page/maps-list/error' });
    } else {
        dispath({
            type: 'maps-list-page/maps-list/success',
            data: {
                maps: {
                    data: response,
                },
            },
        });
    }
};
