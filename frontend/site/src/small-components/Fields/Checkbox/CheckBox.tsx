import React, { FC, ReactElement } from 'react';
import { Field } from 'react-final-form';

import { composeValidators } from 'utils/final-forms';
import { FieldProps } from '../Fields.typings';
import {
    cnCheckboxField,
    cnCheckboxFieldErrorText,
    cnCheckboxFieldInput,
    cnCheckboxFieldLabel,
    cnCheckboxFieldFakeInput,
} from '../Fields.constants';
import TickIcon from '../Fields.assets/tick.svg';

import './style.scss';

interface TextFieldProps {
    name: string;
    title: string;
    validators?: ((value) => undefined | string)[];
    isDisable?: boolean;
}

export const CheckboxField: FC<TextFieldProps> = ({
    name,
    title,
    validators = [],
    isDisable = false,
}: TextFieldProps): ReactElement => {
    return (
        <Field name={name} validate={composeValidators(...validators)} type="checkbox" defaultValue={false}>
            {({ input, meta }: FieldProps<string>): ReactElement => (
                <div
                    className={cnCheckboxField({
                        focus: meta.active,
                        'not-valid': !!meta.error && (!!meta.touched || !!meta.submitSucceeded),
                        checked: input.checked,
                    })}
                >
                    <div className={cnCheckboxFieldInput({ disable: isDisable })}>
                        <input id={name} {...input} />
                        <div className={cnCheckboxFieldFakeInput}>{input.checked && <TickIcon />}</div>
                        <label htmlFor={name} className={cnCheckboxFieldLabel}>
                            {title}
                        </label>
                    </div>

                    <div className={cnCheckboxFieldErrorText}>
                        {!!meta.touched || !!meta.submitSucceeded ? meta.error : ''}
                    </div>
                </div>
            )}
        </Field>
    );
};
