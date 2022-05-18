import React, { FC, ReactElement, useCallback, useState } from 'react';
import { Field } from 'react-final-form';
import cn from 'classnames';

import { composeValidators } from 'utils/final-forms';
import { FieldProps, FieldMeta } from '../fields.typings';

import ViewedIcon from '../fields.assets/viewed.svg';
import NotViewedIcon from '../fields.assets/not-viewed.svg';
import UserIcon from '../fields.assets/user.svg';
import LockIcon from '../fields.assets/lock.svg';
import SearchIcon from '../fields.assets/search.svg';

import styles from './style.scss';

interface TextFieldProps {
    name: string;
    type: 'email-username' | 'password' | 'text' | 'search';
    defaultValue?: string;
    title?: string;
    validators?: ((value) => undefined | string)[];
    isDisable?: boolean;
    onBlur?: (event: React.FocusEvent<HTMLInputElement, Element>, meta: FieldMeta<string>) => void;
    onFocus?: (event: React.FocusEvent<HTMLInputElement, Element>) => void;
    isNoNeedErrors?: boolean;
    theme?: 'default' | 'outlined';
    isInstantlyValidate?: boolean;
}

export const TextField: FC<TextFieldProps> = ({
    name,
    type,
    title,
    onBlur,
    onFocus,
    defaultValue = '',
    validators = [],
    isDisable = false,
    isNoNeedErrors = false,
    theme = 'default',
    isInstantlyValidate = false,
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
                <div className={cn(styles.textField, theme === 'outlined' && styles.outlined)}>
                    {title && (
                        <label htmlFor={name} className={styles.label}>
                            {type === 'email-username' && <UserIcon />}
                            {type === 'password' && <LockIcon />}
                            {title}
                        </label>
                    )}

                    <div className={cn(styles.input, isDisable && styles.disable)}>
                        <input
                            {...input}
                            id={name}
                            type={type === 'password' ? (isVisible ? '' : 'password') : ''}
                            onBlur={handleBlur(input.onBlur, meta)}
                            onFocus={onFocus}
                            autoComplete="off"
                        />
                        {type === 'password' && (
                            <div className={styles.passwordIcon} onClick={toggleVisible}>
                                {isVisible ? <ViewedIcon /> : <NotViewedIcon />}
                            </div>
                        )}
                        {type === 'search' && (
                            <div className={styles.searchIcon}>
                                <SearchIcon />
                            </div>
                        )}
                    </div>

                    {!isNoNeedErrors && (
                        <div className={styles.errorText}>
                            {(isInstantlyValidate && input.value) ||
                            (meta.touched ?? false) ||
                            (meta.submitSucceeded ?? false)
                                ? meta.error
                                : ''}
                        </div>
                    )}
                </div>
            )}
        </Field>
    );
};
