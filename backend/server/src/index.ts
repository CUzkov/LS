import { createServer, ServerResponse, IncomingMessage } from 'http';
import Url from 'url';

import { AUTH_ROUTES, REPOSITORIES_ROUTES } from './routes';
import { middlewares } from './utils/middlewares';
import { getBadRequestResponse } from './utils/server-utils';
import { host, port } from './env';

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
    console.log(`Server is running`);
});

// import {Git} from './git';

// const git = new Git({username: 'cuzkov', email: ''}, 'git1');

// git.getFolderFiles()
