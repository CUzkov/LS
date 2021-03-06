import Cookies from 'cookies';
import { ServerResponse } from 'http';
import { IncomingForm } from 'formidable';

import { Code, MiddlewareRequest } from '../types';
import { getServerErrorResponse } from './server-utils';
import { redis } from '../database';
import { ServerError, errorNames } from './server-error';

enum MiddlewareCode {
    noCookies = 'noCookies',
    noAuth = 'noAuth',
    formDataError = 'formDataError',
}

const middlewaresErrors = {
    [MiddlewareCode.noCookies]: (response: ServerResponse) =>
        getServerErrorResponse(response, new ServerError({ name: errorNames.unauthorized, code: Code.unauthorized })),
    [MiddlewareCode.noAuth]: (response: ServerResponse) =>
        getServerErrorResponse(response, new ServerError({ name: errorNames.unauthorized, code: Code.unauthorized })),
    [MiddlewareCode.formDataError]: (response: ServerResponse) =>
        getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.formReadError, code: Code.internalServerError }),
        ),
};

export const dataMiddleware = (request: MiddlewareRequest, resolve: () => void) => {
    if (request.request.headers['content-type']?.startsWith('multipart/form-data')) {
        return resolve();
    }

    let data = '';
    request.request.on('data', (chunk) => {
        data += chunk;
    });
    request.request.on('end', () => {
        request.body = data ? JSON.parse(data) : undefined;
        resolve();
    });
};

export const cookiesMiddleware = (request: MiddlewareRequest, resolve: () => void) => {
    const cookies = new Cookies(request.request, request.response);
    request.cookies = cookies;
    resolve();
};

export const queryParamsMiddleware = (request: MiddlewareRequest, resolve: () => void) => {
    const queryParams: Record<string, string | string[] | undefined> = {};

    for (const key in request.queryParams ?? {}) {
        if (key.endsWith('[]')) {
            if (Array.isArray(request.queryParams?.[key])) {
                queryParams[key.slice(0, key.length - 2)] = request.queryParams?.[key];
            } else {
                queryParams[key.slice(0, key.length - 2)] = [request.queryParams?.[key] as string];
            }
        } else {
            queryParams[key] = request.queryParams?.[key];
        }
    }

    request.queryParams = queryParams;

    resolve();
};

export const formDataMiddleware = (
    request: MiddlewareRequest,
    resolve: () => void,
    reject: (value: MiddlewareCode) => void,
) => {
    const form = new IncomingForm({ maxFileSize: 1024 * 1024 * 1024 });

    if (!request.request.headers['content-type']?.startsWith('multipart/form-data')) {
        return resolve();
    }

    form.parse(request.request, (err, fields, files) => {
        if (err) {
            reject(MiddlewareCode.formDataError);
        }

        request.formData = { fields, files };

        resolve();
    });
};

export const authMiddleware = async (
    request: MiddlewareRequest,
    resolve: () => void,
    reject: (value: MiddlewareCode) => void,
) => {
    if (!request.callback.isNeedAuth) {
        return resolve();
    }

    if (!request.cookies?.get('user_id')) {
        return reject(MiddlewareCode.noCookies);
    }

    const userId = request.cookies.get('user_id') ?? '';
    const timeNow = new Date().getTime();
    const timeExpired = (await redis.get(userId)) || '1';

    if (Number(timeExpired) > timeNow) {
        request.userId = Number(userId);
        request.isAuth = true;
        resolve();
    }

    reject(MiddlewareCode.noCookies);
};

const MIDDLEWARES = [cookiesMiddleware, authMiddleware, dataMiddleware, formDataMiddleware, queryParamsMiddleware];

export const middlewares = async (middlewareRequest: MiddlewareRequest) => {
    let isError = false;

    for (let i = 0; i < MIDDLEWARES.length; i++) {
        const middleware = MIDDLEWARES[i];

        try {
            const promise = new Promise<void>((resolve, reject) =>
                middleware(middlewareRequest, resolve, reject),
            ).catch((error) => {
                middlewaresErrors[error as MiddlewareCode](middlewareRequest.response);
                isError = true;
            });
            await promise;
        } catch (error) {
            middlewaresErrors[error as MiddlewareCode](middlewareRequest.response);
            isError = true;
            return;
        }

        if (isError) {
            return;
        }
    }

    await middlewareRequest.callback.callback({
        cookies: middlewareRequest.cookies,
        data: middlewareRequest.body,
        userId: middlewareRequest.userId,
        response: middlewareRequest.response,
        queryParams: middlewareRequest.queryParams,
        formData: middlewareRequest.formData,
    });
};
