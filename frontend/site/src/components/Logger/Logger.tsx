import React, { useCallback } from 'react';
import type { FC } from 'react';

import { useDispatch, useSelector } from 'store/store';
import { deleteLog } from 'actions/logger';

import { Log } from './Log';

import styles from './style.scss';

let keys = 0;

export const Logger: FC = () => {
    const loggerStore = useSelector((root) => root.logger);
    const dispatch = useDispatch();

    const onClickCross = useCallback(
        (index: number) => () => {
            deleteLog(dispatch, index);
        },
        [loggerStore.logs.length],
    );

    return (
        <div className={styles.logger}>
            {loggerStore.logs.slice(0, 3).map((log, i) => (
                <Log log={log} key={keys++} onClickCross={onClickCross(i)} />
            ))}
            <div className={styles.loggerHint} />
        </div>
    );
};
