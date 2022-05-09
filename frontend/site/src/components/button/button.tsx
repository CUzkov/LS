import React from 'react';
import type { FC } from 'react';
import cn from 'classnames';

import styles from './style.scss';

interface ButtonProps {
    text: string;
    onClick?: () => void;
    type?: 'submit' | 'button' | 'reset';
    isDisable?: boolean;
    size?: 's' | 'm' | 'l';
}

export const Button: FC<ButtonProps> = ({
    text,
    type = 'button',
    isDisable = false,
    size = 'm',
    onClick,
}: ButtonProps) => {
    return (
        <button
            type={type}
            className={cn(
                styles.button,
                isDisable && styles.disable,
                size === 's' && styles.s,
                size === 'l' && styles.l,
                size === 'm' && styles.m,
            )}
            onClick={onClick}
        >
            {text}
        </button>
    );
};
