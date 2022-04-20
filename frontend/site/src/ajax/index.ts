import axios, { AxiosError, AxiosResponse } from 'axios';

import { getFullUrl } from 'constants/host';
import { store, Dispatch } from 'store';
import { IServerError } from 'types';

export enum AjaxType {
    get,
    post,
    download,
}

export enum ContentType {
    JSON,
}

export interface AjaxProps<D> {
    type: AjaxType;
    url: string;
    contentType?: ContentType;
    data?: D;
    queryParams?: Record<string, string | boolean | number>;
}

export const ajax = {
    async get<RD, QP>({ url, queryParams }: { url: string; queryParams?: QP }) {
        const dispath: Dispatch = store.dispatch;

        let response: AxiosResponse<RD>;

        try {
            response = await axios.get<RD>(getFullUrl(url), {
                withCredentials: true,
                params: queryParams,
            });
        } catch (error) {
            const e = (error as AxiosError).response?.data as IServerError;

            if ((error as AxiosError).response?.status === 401) {
                dispath({ type: 'user/none' });
                return;
            }

            if (e?.name) {
                throw e;
            }

            dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
            return;
        }

        return response.data;
    },
    async post<D, RD, QP>({
        url,
        data,
        queryParams,
        onUploadProgress,
    }: {
        url: string;
        queryParams?: QP;
        data?: FormData | D;
        onUploadProgress?: () => void;
    }) {
        const dispath: Dispatch = store.dispatch;
        let response: AxiosResponse<RD>;

        try {
            response = await axios.post<RD>(getFullUrl(url), data, {
                withCredentials: true,
                params: queryParams,
                headers:
                    data instanceof FormData
                        ? { 'Content-Type': 'multipart/form-data' }
                        : { 'Content-Type': 'application/json' },
                onUploadProgress,
            });
        } catch (error) {
            const e = (error as AxiosError).response?.data as IServerError;

            if ((error as AxiosError).response?.status === 401) {
                dispath({ type: 'user/none' });
                return;
            }

            if (e?.name) {
                throw e;
            }

            dispath({ type: 'logger/add-log', data: { type: 'error', title: 'Ошибка сети :(', description: '' } });
            return;
        }

        return response.data;
    },
};
