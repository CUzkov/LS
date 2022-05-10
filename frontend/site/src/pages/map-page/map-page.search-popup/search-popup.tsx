import React, { useEffect, useState } from 'react';
import { Form, FormSpy } from 'react-final-form';
import cn from 'classnames';

import { MovablePopupManagerContext } from 'components/movable-popup-manager/movable-popup.types';
import { TextField } from 'components/fields';
import { Button } from 'components/button';
import CrossIcon from 'assets/cross.svg';
import SpinnerIcon from 'assets/spinner.svg';
import { useSelector } from 'store';
import { FetchStatus, Group } from 'types';
import { getMapsByTitle } from 'actions/map-page';

import styles from './style.scss';

let ids = 40;

type SerachPopupContentProps<T> = {
    context: MovablePopupManagerContext;
    text: string;
    resolve: (value: Group[] | PromiseLike<Group[]>) => void;
    id: string;
};

const SearchPopupContent = <T,>({ context, text, resolve, id }: SerachPopupContentProps<T>): JSX.Element => {
    let submitButton: () => void;
    const fieldName = 'field';
    const [value, setValue] = useState<string>('');
    const { popupSearchingFetchStatus } = useSelector((root) => root.mapPage);
    const [maps, setMaps] = useState<Group[]>([]);
    const isSearching = popupSearchingFetchStatus === FetchStatus.loading;

    useEffect(() => {
        const timerId = setTimeout(() => {
            getMapsByTitle(
                value,
                maps.map((map) => map.id),
            );
        }, 1000);

        return () => {
            clearTimeout(timerId);
        };
    }, [value]);

    return (
        <div className={styles.searchInputPopup}>
            <div className={styles.searchInputPopupText}>{text}</div>
            <Form
                onSubmit={(values) => {
                    resolve(values[fieldName]);
                    context.removePopup(id);
                }}
                render={({ handleSubmit, hasValidationErrors }) => {
                    submitButton = handleSubmit;
                    return (
                        <>
                            <div className={styles.searchPopupField}>
                                <TextField type="text" name={fieldName} theme="outlined" />
                                <div className={cn(styles.searchPopupSpinner, isSearching && styles.show)}>
                                    <SpinnerIcon />
                                </div>
                            </div>
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
                            <FormSpy
                                children={<></>}
                                subscription={{ values: true }}
                                onChange={({ values }) => {
                                    if (value !== values[fieldName]) {
                                        setValue(values[fieldName]);
                                    }
                                }}
                            />
                        </>
                    );
                }}
            />
        </div>
    );
};

export const serachPopup = (context: MovablePopupManagerContext, text: string, isRequired = true) => {
    const id = String(++ids);

    return new Promise<Group[]>((resolve) => {
        context.addPopup({
            id,
            content: <SearchPopupContent context={context} id={id} resolve={resolve} text={text} />,
            isRequired,
            title: (
                <div className={styles.searchPopupHeader}>
                    <div>{'Ввод'}</div>
                    <div
                        className={styles.searchPopupCross}
                        onClick={() => {
                            resolve([]);
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
