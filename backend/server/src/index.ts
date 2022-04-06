import { createServer, ServerResponse, IncomingMessage } from 'http';
import Url from 'url';

import { AUTH_ROUTES, REPOSITORIES_ROUTES } from './routes';
import { middlewares } from './utils/middlewares';
import { getBadRequestResponse, getOkResponse } from './utils/server-utils';
import { host, port } from './env';
import { Method } from './types';

const ROUTES = {
    ...AUTH_ROUTES,
    ...REPOSITORIES_ROUTES,
};

const requestListener = async (request: IncomingMessage, response: ServerResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Methods', [Method.get, Method.post, Method.options].join(', '));
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    return getBadRequestResponse(response, 'Ошибка роутера', 'Не найден соответствующий роутер');

    // preflight request
    if (request.method === Method.options) {
        return getOkResponse(response);
    }

    const url = Url.parse(request.url || '', true);

    const callback = ROUTES[url.pathname ?? ''];

    if (!callback || callback.method !== request.method) {
        return getBadRequestResponse(response, 'Ошибка роутера', 'Не найден соответствующий роутер');
    }

    // middlewares({ request, response, callback, queryParams: url.query });
};

const server = createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});
