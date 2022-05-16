import { createServer, ServerResponse, IncomingMessage } from 'http';
import Url from 'url';

import { AUTH_ROUTES, REPOSITORIES_ROUTES, GROUPS_ROUTES, USERS_ROUTES } from './routes';
import { middlewares } from './utils/middlewares';
import { getServerErrorResponse, getOkResponse } from './utils/server-utils';
import { host, port } from './env';
import { Code, Method } from './types';
import { errorNames, ServerError } from './utils/server-error';

const ROUTES = {
    ...AUTH_ROUTES,
    ...REPOSITORIES_ROUTES,
    ...GROUPS_ROUTES,
    ...USERS_ROUTES,
};

const requestListener = async (request: IncomingMessage, response: ServerResponse) => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    response.setHeader('Access-Control-Allow-Methods', [Method.get, Method.post, Method.options].join(', '));
    response.setHeader('Access-Control-Allow-Credentials', 'true');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // preflight request
    if (request.method === Method.options) {
        return getOkResponse(response);
    }

    const url = Url.parse(request.url || '', true);

    const callback = ROUTES[url.pathname ?? ''];

    if (!callback || callback.method !== request.method) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.routerError, code: Code.badRequest }),
        );
    }

    middlewares({ request, response, callback, queryParams: url.query });
};

const server = createServer(requestListener);

server.listen(port, host, () => {
    console.log(`Server is running on ${host}:${port}`);
});
