import React, { FC, useCallback, useMemo } from 'react';
import { Form } from 'react-final-form';
import { useSelector } from 'store';
import cn from 'classnames';

import { Badge, BadgeColors, RWAtobadgeColor } from 'components/badge';
import { FetchStatus, RWA } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { TextField } from 'components/fields';
import { Button } from 'components/button';
import { deleteExtraSpaces, entityNameValidator } from 'utils/final-forms';
import { changeRepository } from 'actions/repository-settings-page';

import styles from './style.scss';

export const MainSettings: FC = () => {
    const { repository, repositoryFetchStatus, newTitleFetchStatus } = useSelector(
        (root) => root.repositorySettingsPage,
    );
    const { userId } = useSelector((root) => root.user);
    const isLoadingRepository = repositoryFetchStatus === FetchStatus.loading;
    const isNoneRepository = repositoryFetchStatus === FetchStatus.none;
    const isLoadingNewTitle = newTitleFetchStatus === FetchStatus.loading;

    const badges = useMemo(
        () =>
            [
                {
                    title: `by ${repository?.userId === userId ? 'you' : repository?.username}`,
                    color: BadgeColors.white,
                },
                {
                    title: (repository?.access == RWA.none ? 'no access' : repository?.access) ?? '',
                    color: RWAtobadgeColor(repository?.access ?? RWA.none),
                },
                repository?.isPrivate
                    ? {
                          title: 'приватный',
                          color: BadgeColors.red,
                      }
                    : undefined,
            ].filter(Boolean),
        [repository, userId],
    );

    const handleFormSubmit = useCallback(({ title }: { title: string }) => {
        changeRepository(title);
    }, []);

    return (
        <div className={styles.mainSettings}>
            <div className={cn(styles.content, !isLoadingRepository && !isNoneRepository && styles.show)}>
                {repository && (
                    <Form onSubmit={handleFormSubmit}>
                        {({ values, errors, handleSubmit }) => (
                            <div className={cn(styles.title, isLoadingNewTitle && styles.disable)}>
                                <TextField
                                    name="title"
                                    type="text"
                                    defaultValue={repository?.title}
                                    title={'Название репозитория'}
                                    validators={[entityNameValidator]}
                                    isInstantlyValidate
                                />
                                <div className={styles.applyButton}>
                                    <Button
                                        text="применить"
                                        isDisable={
                                            repository.title === deleteExtraSpaces(values.title ?? '') ||
                                            errors?.title ||
                                            isLoadingNewTitle
                                        }
                                        onClick={handleSubmit}
                                    />
                                </div>
                                <div className={cn(styles.spinner, isLoadingNewTitle && styles.show)}>
                                    <SpinnerIcon />
                                </div>
                            </div>
                        )}
                    </Form>
                )}
                <div className={styles.badges}>{badges.map((badge, i) => badge && <Badge {...badge} key={i} />)}</div>
            </div>
            <div className={cn(styles.spinner, (isLoadingRepository || isNoneRepository) && styles.show)}>
                <SpinnerIcon />
            </div>
        </div>
    );
};
