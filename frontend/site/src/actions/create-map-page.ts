import { ajax } from 'ajax';
import { Empty, Group, GroupType, IServerError } from 'types';
import { Dispatch, store } from 'store';

const CHECK_IS_GROUP_NAME_FREE_URL = '/api/group/free';
const CREATE_GROUP_URL = '/api/group/create';

interface CheckIsGroupNameFreeD {
    title: string;
    groupType: GroupType;
}

interface CheckIsGroupNameFreeRD {
    isFree: boolean;
}

export const checkIsMapNameFree = async (title: string) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-map-form/is-map-name-free/loading' });

    let response: CheckIsGroupNameFreeRD | undefined;

    try {
        response = await ajax.post<CheckIsGroupNameFreeD, CheckIsGroupNameFreeRD, Empty>({
            url: CHECK_IS_GROUP_NAME_FREE_URL,
            data: { title, groupType: GroupType.map },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'create-map-form/is-map-name-free/error' });

        if (e?.name) {
            dispath({
                type: 'logger/add-log',
                data: { title: e.name, description: e.description, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'create-map-form/is-map-name-free/status', data: { isFree: response.isFree } });
};

export const setMapNameNotChecked = () => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-map-form/is-map-name-free/not-checked' });
};

type CreateMapD = {
    title: string;
    groupType: GroupType;
};

type CreateMapRD = Group;

export const createMap = async (title: string) => {
    const dispath: Dispatch = store.dispatch;

    dispath({ type: 'create-map-form/loading' });

    let response: CreateMapRD | undefined;

    try {
        response = await ajax.post<CreateMapD, CreateMapRD, Empty>({
            url: CREATE_GROUP_URL,
            data: { title, groupType: GroupType.map },
        });

        if (!response) {
            return;
        }
    } catch (error) {
        const e = error as IServerError;

        dispath({ type: 'create-map-form/error' });

        if (e?.name) {
            dispath({
                type: 'logger/add-log',
                data: { title: e.name, description: e.description, type: 'error' },
            });
            return;
        }

        dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
        return;
    }

    dispath({ type: 'create-map-form/success', data: response });

    return response;
};
