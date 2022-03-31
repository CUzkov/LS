import Cookies from 'cookies';
import { ServerResponse } from 'http';
import { IncomingForm } from 'formidable';

import { MiddlewareRequest } from '../types';
import { getBadRequestResponse } from './server-utils';
import { redis } from '../database';

enum MiddlewareCode {
    noCookies = 'noCookies',
    noAuth = 'noAuth',
    formDataError = 'formDataError',
}

const middlewaresErrors = {
    [MiddlewareCode.noCookies]: (response: ServerResponse) =>
        getBadRequestResponse(response, 'Ошибка авторизации', 'Вы не авторизованы!'),
    [MiddlewareCode.noAuth]: (response: ServerResponse) =>
        getBadRequestResponse(response, 'Ошибка авторизации', 'Вы не авторизованы!'),
    [MiddlewareCode.formDataError]: (response: ServerResponse) =>
        getBadRequestResponse(response, 'Ошибка чтения формы', ''),
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
            console.log(err);

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

const MIDDLEWARES = [cookiesMiddleware, authMiddleware, dataMiddleware, formDataMiddleware];

export const middlewares = async (middlewareRequest: MiddlewareRequest) => {
    let isError = false;

    for (let i = 0; i < MIDDLEWARES.length; i++) {
        const middleware = MIDDLEWARES[i];

        try {
            const promise = new Promise<void>((resolve, reject) =>
                middleware(middlewareRequest, resolve, reject),
            ).catch((error) => {
                console.log(error);
                middlewaresErrors[error as MiddlewareCode](middlewareRequest.response);
                isError = true;
            });
            await promise;
        } catch (error) {
            console.log(error);

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
