import { ajax, ContentType, AjaxType } from '../ajax';
import { HOST } from '../constants';
import type { IServerError } from '../types';
import type { Dispatch } from '../store';

const LOGIN_URL = '/auth/login';

export interface ILoginProps {
    username: string;
    email: string;
    password: string;
}

export interface IUserFetchData {
    username: string;
    is_admin: boolean;
    id: number;
    email: string;
}

export const useLoginUser = async (dispath: Dispatch, props: ILoginProps) => {
    dispath({ type: 'LOADING' });

    const response = await ajax<IUserFetchData | IServerError, ILoginProps>({
        type: AjaxType.post,
        contentType: ContentType.JSON,
        url: HOST + LOGIN_URL,
        data: props,
    }).catch(() => {
        dispath({ type: 'FAILED' });
        return;
    });

    if (!response) {
        return;
    }

    if ('id' in response) {
        dispath({
            type: 'SUCCESS',
            data: {
                userId: response.id,
                username: response.username,
                email: response.email,
                isAdmin: response.is_admin,
            },
        });
    } else {
        dispath({ type: 'FAILED' });
    }
};
