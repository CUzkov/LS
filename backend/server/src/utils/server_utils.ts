import {ServerResponse} from 'http';

import {Code} from '../types';

export const getBadRequestResponse = (response: ServerResponse, error: string, description: string) => {
    const body = JSON.stringify({
        code: Code.badRequest,
        error,
        description
    });

    response
        .writeHead(Code.badRequest, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8'
        })
        .end(body);
}

export const getUnauthorizedResponse = (response: ServerResponse, error: string, description: string) => {
    const body = JSON.stringify({
        code: Code.unauthorized,
        error,
        description
    });

    response
        .writeHead(Code.badRequest, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8'
        })
        .end(body);
}

export const getOkResponse = <T>(response: ServerResponse, data?: T) => {
    const body = JSON.stringify(data ?? {});

    response
        .writeHead(Code.ok, {
            'Content-Length': Buffer.byteLength(body),
            'Content-Type': 'application/json;charset=utf-8'
        })
        .end(body);
}
