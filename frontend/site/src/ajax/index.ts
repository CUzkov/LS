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

    return fetch(url, {
        headers,
        method: type === AjaxType.get ? 'GET' : 'POST',
        body: type === AjaxType.post ? JSON.stringify(data) : '',
    }).then((result) => result.json());
};
