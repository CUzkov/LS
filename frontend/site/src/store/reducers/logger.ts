const ERROR = 'error';
const SUCCESS = 'success';

export type LogType = typeof ERROR | typeof SUCCESS;

export type Log = {
    title: string;
    type: LogType;
    description: string;
};

export type LoggerEvents =
    | { type: 'logger/add-log'; data: Log }
    | { type: 'logger/delete-log'; data: { index: number } };

export type LoggerStore = {
    logs: Log[];
};

const initialState: LoggerStore = {
    logs: [],
};

export const loggerReducer = (state: LoggerStore = initialState, event: LoggerEvents): LoggerStore => {
    if (event.type === 'logger/add-log') {
        return {
            logs: [...state.logs, event.data],
        };
    }

    if (event.type === 'logger/delete-log') {
        return {
            logs: state.logs.filter((_, i) => i !== event.data.index),
        };
    }

    return state;
};
