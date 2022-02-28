import React, { FC, ReactElement, useCallback, useState } from 'react';
import { Field } from 'react-final-form';

import { composeValidators } from 'utils/final-forms';
import { IsNoneEmptyStr } from 'utils/classname';
import { FieldProps, FieldMeta } from '../Fields.typings';
import {
    cnTextField,
    cnTextFieldErrorText,
    cnTextFieldInput,
    cnTextFieldLabel,
    cnTextFieldPasswordIcon,
    cnTextFieldSearchIcon,
} from '../Fields.constants';

import ViewedIcon from '../Fields.assets/viewed.svg';
import NotViewedIcon from '../Fields.assets/not-viewed.svg';
import UserIcon from '../Fields.assets/user.svg';
import LockIcon from '../Fields.assets/lock.svg';
import SearchIcon from '../Fields.assets/search.svg';

import './style.scss';

interface TextFieldProps {
    name: string;
    type: 'email-username' | 'password' | 'text' | 'search';
    defaultValue?: string;
    title?: string;
    validators?: ((value) => undefined | string)[];
    isDisable?: boolean;
    onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>, meta: FieldMeta<string>) => void;
    isNoNeedErrors?: boolean;
}

export const TextField: FC<TextFieldProps> = ({
    name,
    type,
    title,
    onBlur,
    defaultValue = '',
    validators = [],
    isDisable = false,
    isNoNeedErrors = false,
}: TextFieldProps): ReactElement => {
    const [isVisible, setIsVisible] = useState<boolean>(false);

    const toggleVisible = useCallback(() => {
        setIsVisible((prev) => !prev);
    }, []);

    const handleBlur = useCallback(
        (defaultBlur: React.FocusEventHandler<HTMLInputElement>, meta: FieldMeta<string>) =>
            (event: React.FocusEvent<HTMLInputElement, Element>) => {
                defaultBlur(event);
                onBlur?.(event, meta);
            },
        [onBlur],
    );

    return (
        <Field name={name} validate={composeValidators(...validators)} defaultValue={defaultValue}>
            {({ input, meta }: FieldProps<string>): ReactElement => (
                <div
                    className={cnTextField({
                        focus: meta.active,
                        'not-valid': IsNoneEmptyStr(meta.error) && ((meta.touched ?? false) || meta.submitSucceeded),
                    })}
                >
                    {title && (
                        <label htmlFor={name} className={cnTextFieldLabel}>
                            {type === 'email-username' && <UserIcon />}
                            {type === 'password' && <LockIcon />}
                            {title}
                        </label>
                    )}

                    <div className={cnTextFieldInput({ disable: isDisable })}>
                        <input
                            {...input}
                            id={name}
                            type={type === 'password' ? (isVisible ? '' : 'password') : ''}
                            onBlur={handleBlur(input.onBlur, meta)}
                        />
                        {type === 'password' && (
                            <div className={cnTextFieldPasswordIcon} onClick={toggleVisible}>
                                {isVisible ? <ViewedIcon /> : <NotViewedIcon />}
                            </div>
                        )}
                        {type === 'search' && (
                            <div className={cnTextFieldSearchIcon}>
                                <SearchIcon />
                            </div>
                        )}
                    </div>

                    {!isNoNeedErrors && (
                        <div className={cnTextFieldErrorText}>
                            {(meta.touched ?? false) || (meta.submitSucceeded ?? false) ? meta.error : ''}
                        </div>
                    )}
                </div>
            )}
        </Field>
    );
};
