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

export type RequestPaylod<T, P> = {
    userId?: number;
    data?: T;
    cookies?: Cookies;
    queryParams?: P;
    response: ServerResponseHttp;
};

export type ResponseCallback<T, P> = (payload: RequestPaylod<T, P>) => Promise<void>;

export enum Method {
    get = 'GET',
    post = 'POST',
}

export type Route = {
    name: string;
    callback: ResponseCallback<any, any>;
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
    queryParams?: Record<string, string | string[] | undefined>;
};

export type Empty = Record<string, never>;
