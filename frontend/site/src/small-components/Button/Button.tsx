import React from 'react';
import type { FC } from 'react';

import { cnButton } from './Button.constants';

import './style.scss';

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
            className={cnButton({
                disable: isDisable,
                size,
            })}
            onClick={onClick}
        >
            {text}
        </button>
    );
};
