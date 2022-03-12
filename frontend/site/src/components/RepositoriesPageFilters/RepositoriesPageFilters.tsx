import React, { FC, useCallback } from 'react';
import { Form, FormSpy, useField, useForm } from 'react-final-form';

import { TextField } from 'small-components/Fields/TextField/TextField';
import { SelectField } from 'small-components/Fields/SelectField/SelectField';
import { Button } from 'small-components/Button';
import { useQueryParams, StringParam, NumberParam, BooleanParam } from 'use-query-params';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { useDispatch } from 'store/store';
import { RWA } from 'types/index';

import styles from './style.scss';

const getRwaFromFlags = (is_rw: boolean, is_rwa: boolean) => {
    if (is_rw) {
        return RWA.rw;
    }

    if (is_rwa) {
        return RWA.rwa;
    }

    return RWA.r;
};

const options = [
    {
        title: 'Все доступные репозитории',
        value: RWA.r,
    },
    {
        title: 'Репозитории с разрешённой записью',
        value: RWA.rw,
    },
    {
        title: 'Репозитории с полным доступом',
        value: RWA.rwa,
    },
];

export const RepositoriesPageFilters: FC = () => {
    const dispatch = useDispatch();

    const [query, setQuery] = useQueryParams({
        by_user: NumberParam,
        is_rw: BooleanParam,
        is_rwa: BooleanParam,
        title: StringParam,
    });

    const handleSubmitTitleForm = useCallback(
        (values: { title: string }) => {
            getPageRepositoriesByFilters(dispatch, {
                by_user: -1,
                is_rw: !!query.is_rw,
                is_rwa: !!query.is_rwa,
                title: values.title || '',
            });

            setQuery({ title: values.title || undefined });
        },
        [query],
    );

    const handleRwaChange = useCallback(
        (value: RWA) => {
            const isRw = value === RWA.rw;
            const isRwa = value === RWA.rwa;

            getPageRepositoriesByFilters(dispatch, {
                by_user: -1,
                is_rw: isRw,
                is_rwa: isRwa,
                title: query.title || '',
            });

            setQuery({
                ...{ is_rw: undefined, is_rwa: undefined },
                ...(isRw ? { is_rw: isRw } : {}),
                ...(isRwa ? { is_rwa: isRwa } : {}),
            });
        },
        [query],
    );

    return (
        <div className={styles.repositoriesPageFilters}>
            <Form
                onSubmit={() => {}}
                render={() => (
                    <form className={styles.rwaForm}>
                        <div className={styles.rwaField}>
                            <SelectField
                                name="rwa"
                                options={options}
                                defaultValue={getRwaFromFlags(!!query.is_rw, !!query.is_rwa)}
                            />
                        </div>
                        <FormSpy
                            render={() => <></>}
                            subscription={{ values: true }}
                            onChange={(form) => {
                                if (getRwaFromFlags(!!query.is_rw, !!query.is_rwa) !== form.values.rwa) {
                                    handleRwaChange(form.values.rwa);
                                }
                            }}
                        />
                    </form>
                )}
            />
            <Form
                onSubmit={handleSubmitTitleForm}
                render={({ handleSubmit, modified, dirtySinceLastSubmit, values, form }) => (
                    <form onSubmit={handleSubmit} className={styles.searchForm}>
                        <div className={styles.searchField}>
                            <TextField name="title" type="search" isNoNeedErrors defaultValue={query.title || ''} />
                        </div>
                        <div className={styles.findButton}>
                            <Button
                                text="найти"
                                type="submit"
                                isDisable={
                                    (values.title ?? '') === (query.title ?? '') ||
                                    (!dirtySinceLastSubmit && !modified?.title)
                                }
                            />
                        </div>
                        <div className={styles.resetButton}>
                            <Button
                                text="сбросить"
                                type="button"
                                isDisable={!values.title && !query.title}
                                onClick={() => {
                                    form.reset();

                                    if (query.title) {
                                        handleSubmitTitleForm({ title: '' });
                                    }
                                }}
                            />
                        </div>
                    </form>
                )}
            />
        </div>
    );
};
