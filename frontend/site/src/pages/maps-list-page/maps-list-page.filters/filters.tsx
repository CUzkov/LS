import React, { FC, useCallback } from 'react';
import { useQueryParams } from 'use-query-params';
import { Form } from 'react-final-form';

import { TextField } from 'components/fields';
import { Button } from 'components/button';
import { getMapsByFilters } from 'actions/maps-list-page';
import { noop } from 'utils/noop';
// import { getRwaFromFlags } from 'utils/rwa';
// import { RWA } from 'types';

import { queryParams } from '../maps-list-page.constants';

import styles from './style.scss';

export const MapsPageFilters: FC = () => {
    const [query, setQuery] = useQueryParams(queryParams);

    const handleSubmitTitleForm = useCallback(
        (values: { title: string }) => {
            getMapsByFilters({
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

    // const handleRwaChange = useCallback(
    //     (value: RWA) => {
    //         const isRw = value === RWA.rw;
    //         const isRwa = value === RWA.rwa;

    //         getMapsByFilters({
    //             by_user: -1,
    //             is_rw: isRw,
    //             is_rwa: isRwa,
    //             title: query.title || '',
    //             page: 1,
    //         });

    //         setQuery({
    //             ...{ is_rw: undefined, is_rwa: undefined },
    //             ...(isRw ? { is_rw: isRw } : {}),
    //             ...(isRwa ? { is_rwa: isRwa } : {}),
    //             page: undefined,
    //         });
    //     },
    //     [query],
    // );

    return (
        <div className={styles.mapsPageFilters}>
            <Form
                onSubmit={noop}
                render={() => (
                    <form className={styles.rwaForm}>
                        <div className={styles.rwaField}>
                            {/* FIXME баг на беке в get_groups_by_filter */}
                            {/* <SelectField
                                name="rwa"
                                options={options}
                                defaultValue={getRwaFromFlags(!!query.is_rw, !!query.is_rwa)}
                            /> */}
                        </div>
                        {/* <FormSpy
                            render={() => <></>}
                            subscription={{ values: true }}
                            onChange={(form) => {
                                if (getRwaFromFlags(!!query.is_rw, !!query.is_rwa) !== form.values.rwa) {
                                    handleRwaChange(form.values.rwa);
                                }
                            }}
                        /> */}
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
