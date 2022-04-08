import React, { useCallback, useMemo, useState } from 'react';
import cn from 'classnames';
import type { FC } from 'react';

import type { Log as ILog } from 'store/reducers/logger';

import OkIcon from './log.assets/ok.svg';
import ErrorIcon from './log.assets/error.svg';
import CrossIcon from './log.assets/cross.svg';

import styles from './style.scss';

interface ILogProps {
    log: ILog;
    onClickCross: () => void;
}

export const Log: FC<ILogProps> = ({ log, onClickCross }) => {
    const [isClickCross, setIsClickCross] = useState(false);
    const logTypeStyle = useMemo(() => {
        if (log.type === 'error') return styles.error;
        if (log.type === 'success') return styles.success;
    }, [log.type]);

    const handleClick = useCallback(() => {
        setIsClickCross(true);
    }, []);

    return (
        <div
            className={cn(styles.log, logTypeStyle, isClickCross && styles.close)}
            onTransitionEndCapture={onClickCross}
        >
            {log.title && (
                <div className={styles.title}>
                    {log.title}
                    <div onClick={handleClick}>
                        <CrossIcon />
                    </div>
                </div>
            )}
            {log.description && (
                <div className={styles.description}>
                    {log.type === 'success' ? <OkIcon /> : <ErrorIcon />}
                    {log.description}
                </div>
            )}
        </div>
    );
};
