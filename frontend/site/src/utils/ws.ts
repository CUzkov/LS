import {Events as EditorEvents} from '../../../../api-types/ws-servers/repository-editor'

export const establishWsConnection = (cb: (ws: WebSocket) => void) => {
    const ws = new WebSocket('ws://localhost:8080');

    ws.onopen = () => {
        ws.onmessage = async (message: MessageEvent<string>) => {
            const isOk = message.data.split('~')?.[1] === EditorEvents.GET_CONNECTION_OK;

            if (!isOk) {
                throw new Error("");
            }

            cb(ws);
        }
    }
}
