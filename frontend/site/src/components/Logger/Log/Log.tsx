import React, { useCallback, useState } from 'react';
import type { FC } from 'react';

import type { Log as ILog } from 'store/reducers/logger';

import { cnLog, cnLogDescription, cnLogTitle } from './Log.constants';

import OkIcon from './Log.assets/ok.svg';
import ErrorIcon from './Log.assets/error.svg';
import CrossIcon from './Log.assets/cross.svg';

import './style.scss';

interface ILogProps {
    log: ILog;
    onClickCross: () => void;
}

export const Log: FC<ILogProps> = ({ log, onClickCross }) => {
    const [isClickCross, setIsClickCross] = useState(false);
    const onClick = useCallback(() => {
        setIsClickCross(true);
    }, []);

    return (
        <div className={cnLog({ type: log.type, close: isClickCross })} onTransitionEndCapture={onClickCross}>
            {log.title && (
                <div className={cnLogTitle}>
                    {log.title}
                    <div onClick={onClick}>
                        <CrossIcon />
                    </div>
                </div>
            )}
            {log.description && (
                <div className={cnLogDescription}>
                    {log.type === 'success' ? <OkIcon /> : <ErrorIcon />}
                    {log.description}
                </div>
            )}
        </div>
    );
};
