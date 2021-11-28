import React, { FC, ReactElement, useCallback, useState } from 'react';
import { Field } from 'react-final-form';

import { composeValidators } from '../../../utils/final-forms';
import { IsNoneEmptyStr } from '../../../utils';
import { FieldProps } from '../Fields.typings';
import { cnField, cnFieldInput, cnFieldPasswordIcon, cnFieldLabel, cnFieldErrorText } from '../Fields.constants';

import ViewedIcon from '../Fields.assets/viewed.svg';
import NotViewedIcon from '../Fields.assets/not-viewed.svg';
import UserIcon from '../Fields.assets/user.svg';
import LockIcon from '../Fields.assets/lock.svg';

import './style.scss';

interface TextFieldProps {
    name: string;
    type: 'email-username' | 'password';
    title: string;
    validators?: ((value) => undefined | string)[];
    isDisable?: boolean;
}

export const TextField: FC<TextFieldProps> = ({
    name,
    type,
    title,
    validators = [],
    isDisable = false,
}: TextFieldProps): ReactElement => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const toggleVisible = useCallback(() => {
        setIsVisible((prev) => !prev);
    }, []);

    return (
        <Field name={name} validate={composeValidators(...validators)}>
            {({ input, meta }: FieldProps<string>): ReactElement => (
                <div
                    className={cnField({
                        focus: meta.active,
                        'not-valid': IsNoneEmptyStr(meta.error) && ((meta.touched ?? false) || meta.submitSucceeded),
                    })}
                >
                    <label htmlFor={name} className={cnFieldLabel}>
                        {type === 'email-username' && <UserIcon />}
                        {type === 'password' && <LockIcon />}
                        {title}
                    </label>

                    <div className={cnFieldInput({ disable: isDisable })}>
                        <input id={name} type={type === 'password' ? (isVisible ? '' : 'password') : ''} {...input} />
                        {type === 'password' && (
                            <div className={cnFieldPasswordIcon} onClick={toggleVisible}>
                                {isVisible ? <ViewedIcon /> : <NotViewedIcon />}
                            </div>
                        )}
                    </div>

                    <div className={cnFieldErrorText}>
                        {(meta.touched ?? false) || (meta.submitSucceeded ?? false) ? meta.error : ''}
                    </div>
                </div>
            )}
        </Field>
    );
};
