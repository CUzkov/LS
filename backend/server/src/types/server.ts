import { IncomingMessage, ServerResponse as ServerResponseHttp } from 'http';
import Cookies from 'cookies';

export enum Code {
    ok = 200,
    created = 201,
    unauthorized = 401,
    badRequest = 404,
    internalServerError = 500,
}

export type ServerError = {
    error: string;
    description: string;
};

export type ServerResponse<T> = {
    data?: T;
};

export type RequestPaylod<T> = {
    userId?: number;
    data?: T;
    cookies?: Cookies;
    response: ServerResponseHttp;
};

export type ResponseCallback<T> = (payload: RequestPaylod<T>) => Promise<void>;

export enum Method {
    get = 'GET',
    post = 'POST',
}

export type Route = {
    name: string;
    callback: ResponseCallback<any>;
    method: Method;
    isNeedAuth: boolean;
};

export type MiddlewareRequest = {
    response: ServerResponseHttp;
    request: IncomingMessage;
    callback: Route;
    cookies?: Cookies;
    userId?: number;
    isAuth?: boolean;
    body?: string;
};
