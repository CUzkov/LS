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
}

export const ajax = async <T, D>({ type, url, contentType, data }: AjaxProps<D>): Promise<T> => {
    const headers = {};

    if (contentType === ContentType.JSON) {
        headers['Content-Type'] = 'application/json;charset=utf-8';
    }

    if (type === AjaxType.get) {
        return fetch(url, {
            headers,
            method: 'GET',
            credentials: 'include',
        }).then((result) => result.json());
    }

    return fetch(url, {
        headers,
        method: 'POST',
        body: JSON.stringify(data),
        credentials: 'include',
    }).then((result) => result.json());
};
