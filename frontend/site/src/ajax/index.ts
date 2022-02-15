export enum AjaxType {
    get,
    post,
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

    return fetch(urlWithQueryParams, {
        headers,
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
    }).then((result) => result.json());
};
