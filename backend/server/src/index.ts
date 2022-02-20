import { createServer, ServerResponse, IncomingMessage } from 'http';

import { AUTH_ROUTES } from './routes';
import { getBadRequestResponse, middlewares } from './utils';

const host = 'localhost';
const port = 8000;

const ROUTES = {
    ...AUTH_ROUTES,
};

const requestListener = async (request: IncomingMessage, response: ServerResponse) => {
    const callback = ROUTES[request.url ?? ''];

    if (!callback || callback.method !== request.method) {
        return getBadRequestResponse(response, 'Ошибка роутера', 'Не найден соответствующий роутер');
    }

    await middlewares({ request, response, callback });
};

const server = createServer(requestListener);
server.listen(port, host, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
