import { createServer, ServerResponse, IncomingMessage } from 'http';
import Url from 'url';

import { AUTH_ROUTES, REPOSITORIES_ROUTES } from './routes';
import { getBadRequestResponse, middlewares } from './utils';

const host = 'localhost';
const port = 8000;

const ROUTES = {
    ...AUTH_ROUTES,
    ...REPOSITORIES_ROUTES,
};

const requestListener = async (request: IncomingMessage, response: ServerResponse) => {
    const url = Url.parse(request.url || '', true);

    const callback = ROUTES[url.pathname ?? ''];

    if (!callback || callback.method !== request.method) {
        return getBadRequestResponse(response, 'Ошибка роутера', 'Не найден соответствующий роутер');
    }

    await middlewares({ request, response, callback, queryParams: url.query });
};

const server = createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
