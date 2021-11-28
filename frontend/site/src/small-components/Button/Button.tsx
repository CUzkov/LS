import React from 'react';
import type { FC } from 'react';

import { cnButton } from './Button.constants';

import './style.scss';

interface ButtonProps {
    text: string;
    type?: 'submit' | 'button' | 'reset';
    isDisable?: boolean;
    size?: 's' | 'm' | 'l';
}

export const Button: FC<ButtonProps> = ({ text, type = 'button', isDisable = false, size = 'm' }: ButtonProps) => {
    return (
        <button
            type={type}
            className={cnButton({
                disable: isDisable,
                size,
            })}
        >
            {text}
        </button>
    );
};
