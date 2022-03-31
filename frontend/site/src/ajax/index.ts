import axios from 'axios';

import { getFullUrl } from 'constants/host';

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

export const ajax = async <T, D>({ type, url, contentType, data, queryParams }: AjaxProps<D>): Promise<T> => {
    const headers = {};

    if (contentType === ContentType.JSON) {
        headers['Content-Type'] = 'application/json;charset=utf-8';
    }

    let urlWithQueryParams = url;

    if (queryParams) {
        const qs =
            '?' +
            Object.entries(queryParams)
                .map((entry) => `${entry[0]}=${entry[1]}`)
                .join('&');

        if (qs !== '?') {
            urlWithQueryParams += qs;
        }
    }

    if (type === AjaxType.get) {
        return fetch(urlWithQueryParams, {
            headers,
            method: 'GET',
            credentials: 'include',
        }).then((result) => result.json());
    }

    if (type === AjaxType.download) {
        return fetch(urlWithQueryParams, {
            headers,
            method: 'GET',
            credentials: 'include',
        }).then((result) => result.blob() as Promise<any>);
    }

    return fetch(urlWithQueryParams, {
        headers,
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
    }).then((result) => result.json());
};

export const ajax2 = {
    async get<RD, QP>({ url, queryParams }: { url: string; queryParams?: QP }) {
        return (
            await axios.get<RD>(getFullUrl(url), {
                withCredentials: true,
                params: queryParams,
            })
        ).data;
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
        onUploadProgress?: (e: {}) => void;
    }) {
        return (
            await axios.post<RD>(getFullUrl(url), data, {
                withCredentials: true,
                params: queryParams,
                headers: data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {},
                onUploadProgress,
            })
        ).data;
    },
};
