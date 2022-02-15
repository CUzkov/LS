import React, { FC, ReactElement, useCallback, useRef, Fragment } from 'react';
import { Field, useForm } from 'react-final-form';

import { composeValidators } from 'utils/final-forms';
import { FieldProps } from '../Fields.typings';
import {
    cnSelectField,
    cnSelectFieldButton,
    cnSelectFieldChevron,
    cnSelectFieldOptions,
    cnSelectFieldOption,
    cnSelectFieldOptionLine,
    cnSelectFieldButtonText,
} from '../Fields.constants';
import { useOutsideClick, useBooleanState } from 'hooks/index';

import ChevronIcon from '../Fields.assets/chevron.svg';

import './style.scss';

interface SelectFieldProps {
    name: string;
    options: {
        value: string;
        title: string;
    }[];
    defaultValue?: string;
    validators?: ((value) => undefined | string)[];
}

export const SelectField: FC<SelectFieldProps> = ({
    name,
    options,
    defaultValue,
    validators = [],
}: SelectFieldProps): ReactElement => {
    const form = useForm();

    const [isExpand, , closeSelect, toggleSelect] = useBooleanState(false);

    const handleClickOption = useCallback(
        (i: number) => {
            form.change(name, options[i].value);
            closeSelect();
        },
        [form, name, closeSelect, options],
    );

    const selectRef = useRef(null);

    useOutsideClick(selectRef, closeSelect);

    return (
        <Field
            name={name}
            validate={composeValidators(...validators)}
            defaultValue={defaultValue || options?.[0]?.value}
        >
            {({ input }: FieldProps<string>): ReactElement => (
                <div className={cnSelectField} ref={selectRef}>
                    <select {...input} id={name}>
                        {options.map((option, i) => (
                            <option value={i} key={option.title}>
                                {option.title}
                            </option>
                        ))}
                    </select>
                    <div className={cnSelectFieldButton} onClick={toggleSelect}>
                        {options.map(
                            (option) =>
                                option.value === input.value && (
                                    <span key={option.title} className={cnSelectFieldButtonText}>
                                        {option.title}
                                    </span>
                                ),
                        )}
                        <div className={cnSelectFieldChevron({ expand: isExpand })}>
                            <ChevronIcon />
                        </div>
                    </div>
                    <div className={cnSelectFieldOptions({ expand: isExpand })}>
                        {options.map((option, i) => (
                            <Fragment key={option.title}>
                                <div className={cnSelectFieldOptionLine} />
                                <div
                                    className={cnSelectFieldOption({ active: input.value === option.value })}
                                    onClick={() => handleClickOption(i)}
                                >
                                    {option.title}
                                </div>
                            </Fragment>
                        ))}
                        <div className={cnSelectFieldOptionLine} />
                    </div>
                </div>
            )}
        </Field>
    );
};
