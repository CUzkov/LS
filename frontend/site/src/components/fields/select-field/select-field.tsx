import React, { FC, ReactElement, useCallback, useRef, Fragment } from 'react';
import { Field, useForm } from 'react-final-form';
import cn from 'classnames';

import { composeValidators } from 'utils/final-forms';
import { useOutsideClick, useBooleanState } from 'hooks/index';

import ChevronIcon from '../fields.assets/chevron.svg';
import { FieldProps } from '../fields.typings';

import styles from './style.scss';

export type SelectOption = {
    value: string;
    title: string;
};

interface SelectFieldProps {
    name: string;
    options: SelectOption[];
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
    const selectRef = useRef(null);
    const [isExpand, , closeSelect, toggleSelect] = useBooleanState(false);

    const handleClickOption = useCallback(
        (i: number) => {
            form.change(name, options[i].value);
            closeSelect();
        },
        [form, name, closeSelect, options],
    );

    const handleToggleSelect = useCallback(() => {
        if (!options.length) {
            return;
        }

        toggleSelect();
    }, [options, toggleSelect]);

    useOutsideClick(selectRef, closeSelect);

    return (
        <Field
            name={name}
            validate={composeValidators(...validators)}
            defaultValue={defaultValue || options?.[0]?.value}
        >
            {({ input }: FieldProps<string>): ReactElement => (
                <div className={styles.selectField} ref={selectRef}>
                    <select {...input} id={name}>
                        {options.map((option, i) => (
                            <option value={i} key={option.title}>
                                {option.title}
                            </option>
                        ))}
                    </select>
                    <div className={styles.button} onClick={handleToggleSelect}>
                        {options.map(
                            (option) =>
                                option.value === input.value && (
                                    <span key={option.title} className={styles.buttonText}>
                                        {option.title}
                                    </span>
                                ),
                        )}
                        <div className={cn(styles.chevron, isExpand && styles.expand)}>
                            <ChevronIcon />
                        </div>
                    </div>
                    <div className={cn(styles.options, isExpand && styles.expand)}>
                        {options.map((option, i) => (
                            <Fragment key={option.title}>
                                <div className={styles.optionLine} />
                                <div
                                    className={cn(styles.option, input.value === option.value && styles.active)}
                                    onClick={() => handleClickOption(i)}
                                >
                                    {option.title}
                                </div>
                            </Fragment>
                        ))}
                        <div className={styles.optionLine} />
                    </div>
                </div>
            )}
        </Field>
    );
};
