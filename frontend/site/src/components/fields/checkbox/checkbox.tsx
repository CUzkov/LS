import React, { FC, ReactElement } from 'react';
import cn from 'classnames';
import { Field } from 'react-final-form';

import { composeValidators } from 'utils/final-forms';

import { FieldProps } from '../fields.typings';

import TickIcon from '../fields.assets/tick.svg';

import styles from './style.scss';

interface TextFieldProps {
    name: string;
    title: string;
    defaultValue?: boolean;
    validators?: ((value) => undefined | string)[];
    isDisable?: boolean;
    isNoNeedErroText?: boolean;
}

export const CheckboxField: FC<TextFieldProps> = ({
    name,
    title,
    defaultValue = false,
    validators = [],
    isDisable = false,
    isNoNeedErroText = false,
}: TextFieldProps): ReactElement => {
    return (
        <Field name={name} validate={composeValidators(...validators)} type="checkbox" defaultValue={defaultValue}>
            {({ input, meta }: FieldProps<string>): ReactElement => (
                <div className={cn(styles.checkboxField, input.checked && styles.checked)}>
                    <div className={cn(styles.input, isDisable && styles.disable)}>
                        <input id={name} {...input} />
                        <div className={styles.fakeInput}>{input.checked && <TickIcon />}</div>
                        <label htmlFor={name} className={styles.label}>
                            {title}
                        </label>
                    </div>

                    {!isNoNeedErroText && (
                        <div className={styles.errorText}>
                            {!!meta.touched || !!meta.submitSucceeded ? meta.error : ''}
                        </div>
                    )}
                </div>
            )}
        </Field>
    );
};
