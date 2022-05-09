import React, { FC, useCallback } from 'react';
import { useQueryParams } from 'use-query-params';
import { Form, FormSpy } from 'react-final-form';

import { TextField, SelectField } from 'components/fields';
import { Button } from 'components/button';
import { getPageRepositoriesByFilters } from 'actions/repositories-list-page';
import { noop } from 'utils/noop';
import { RWA } from 'types';
import { getRwaFromFlags } from 'utils/rwa';

import { filtersOptions, queryParams } from '../repositories-list-page.constants';

import styles from './style.scss';

export const RepositoriesPageFilters: FC = () => {
    const [query, setQuery] = useQueryParams(queryParams);

    const handleSubmitTitleForm = useCallback(
        (values: { title: string }) => {
            getPageRepositoriesByFilters({
                by_user: -1,
                is_rw: !!query.is_rw,
                is_rwa: !!query.is_rwa,
                title: values.title || '',
                page: 1,
            });

            setQuery({ title: values.title || undefined, page: undefined });
        },
        [query],
    );

    const handleRwaChange = useCallback(
        (value: RWA) => {
            const isRw = value === RWA.rw;
            const isRwa = value === RWA.rwa;

            getPageRepositoriesByFilters({
                by_user: -1,
                is_rw: isRw,
                is_rwa: isRwa,
                title: query.title || '',
                page: 1,
            });

            setQuery({
                ...{ is_rw: undefined, is_rwa: undefined },
                ...(isRw ? { is_rw: isRw } : {}),
                ...(isRwa ? { is_rwa: isRwa } : {}),
                page: undefined,
            });
        },
        [query],
    );

    return (
        <div className={styles.repositoriesPageFilters}>
            <Form
                onSubmit={noop}
                render={() => (
                    <form className={styles.rwaForm}>
                        <div className={styles.rwaField}>
                            <SelectField
                                name="rwa"
                                options={filtersOptions}
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
