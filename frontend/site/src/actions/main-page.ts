import { ajax, ContentType, AjaxType } from '../ajax';
import type { IServerError, Map, Empty } from '../types';
import type { Dispatch } from '../store';

const MAIN_PAGE_USER_MAPS = '/api/maps/all/my';

export const getMainPageUserMaps = async (dispath: Dispatch) => {
    dispath({ type: 'main-page/maps/loading' });

    const response = await ajax<Map[] | IServerError, Empty>({
        type: AjaxType.get,
        contentType: ContentType.JSON,
        url: MAIN_PAGE_USER_MAPS,
    }).catch(() => {
        dispath({ type: 'main-page/maps/error' });
        return {
            error: 'unknouw error',
        };
    });

    if ('error' in response) {
        dispath({ type: 'main-page/maps/error' });
    } else {
        dispath({
            type: 'main-page/maps/success',
            data: {
                maps: {
                    data: response,
                },
            },
        });
    }
};
