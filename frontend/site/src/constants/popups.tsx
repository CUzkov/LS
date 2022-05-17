import React from 'react';
import { Form } from 'react-final-form';

import { MovablePopupManagerContext } from 'components/movable-popup-manager/movable-popup.types';
import { requiredValidate, Validator } from 'utils/final-forms';
import { TextField } from 'components/fields';
import { Button } from 'components/button';
import CrossIcon from 'assets/cross.svg';

import styles from './popups.scss';

let ids = 0;

export const yesNoPopup = (context: MovablePopupManagerContext, title: string, text: string, isRequired: boolean) => {
    const id = String(++ids);
    return new Promise<boolean>((resolve) => {
        context.addPopup({
            id,
            content: (
                <div>
                    <div className={styles.searchPopupTitle}>{text}</div>
                    <div className={styles.buttons}>
                        <div className={styles.button}>
                            <Button
                                size="m"
                                text="нет"
                                onClick={() => {
                                    resolve(false);
                                    context.removePopup(id);
                                }}
                            />
                        </div>
                        <div className={styles.button}>
                            <Button
                                size="m"
                                text="да"
                                onClick={() => {
                                    resolve(true);
                                    context.removePopup(id);
                                }}
                            />
                        </div>
                    </div>
                </div>
            ),
            isRequired,
            title,
        });
    });
};

export const textInputPopup = (
    context: MovablePopupManagerContext,
    text: string,
    defaultValue: string,
    isRequired = true,
    validators?: Validator[],
    isInstantlyValidate?: boolean,
) => {
    const id = String(++ids);
    const fieldName = 'field';
    let submitButton: () => void;

    return new Promise<string>((resolve) => {
        context.addPopup({
            id,
            content: (
                <div className={styles.textInputPopup}>
                    <div className={styles.textInputPopupText}>{text}</div>
                    <Form
                        onSubmit={(values) => {
                            resolve(values[fieldName]);
                            context.removePopup(id);
                        }}
                        render={({ handleSubmit, hasValidationErrors }) => {
                            submitButton = handleSubmit;
                            return (
                                <>
                                    <TextField
                                        validators={[requiredValidate, ...(validators ? validators : [])]}
                                        type="text"
                                        name={fieldName}
                                        defaultValue={defaultValue}
                                        theme="outlined"
                                        isInstantlyValidate={isInstantlyValidate}
                                    />
                                    <div className={styles.buttons}>
                                        <div className={styles.button}>
                                            <Button
                                                size="m"
                                                text="ок"
                                                onClick={() => submitButton?.()}
                                                isDisable={hasValidationErrors}
                                            />
                                        </div>
                                    </div>
                                </>
                            );
                        }}
                    />
                </div>
            ),
            isRequired,
            title: (
                <div className={styles.textInputPopupHeader}>
                    <div className={styles.textInputPopupText}>{'Ввод'}</div>
                    <div
                        className={styles.textInputPopupCross}
                        onClick={() => {
                            resolve('');
                            context.removePopup(id);
                        }}
                    >
                        <CrossIcon />
                    </div>
                </div>
            ),
        });
    });
};
