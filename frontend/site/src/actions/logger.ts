import type { Dispatch } from '../store';
import type { Log } from 'store/reducers/logger';

export const addLog = async (dispath: Dispatch, log: Log) => {
    dispath({ type: 'logger/add-log', data: log });
};

export const deleteLog = async (dispath: Dispatch, index: number) => {
    dispath({ type: 'logger/delete-log', data: { index } });
};
