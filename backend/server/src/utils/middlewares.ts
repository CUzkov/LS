import Cookies from 'cookies';
import { ServerResponse } from 'http';

import { MiddlewareRequest } from '../types';
import { getBadRequestResponse } from './server_utils';
import { redis } from '../database';

enum MiddlewareCode {
    noCookies = 'noCookies',
    noAuth = 'noAuth',
}

const middlewaresErrors = {
    [MiddlewareCode.noCookies]: (response: ServerResponse) =>
        getBadRequestResponse(response, 'Ошибка авторизации', 'Вы не авторизованы!'),
    [MiddlewareCode.noAuth]: (response: ServerResponse) =>
        getBadRequestResponse(response, 'Ошибка авторизации', 'Вы не авторизованы!'),
};

export const dataMiddleware = (request: MiddlewareRequest, resolve: () => void) => {
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

    if (timeNow > Number(timeExpired)) {
        request.userId = Number(userId);
        request.isAuth = true;
        resolve();
    }

    reject(MiddlewareCode.noCookies);
};

const MIDDLEWARES = [dataMiddleware, cookiesMiddleware, authMiddleware];

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
    });
};
