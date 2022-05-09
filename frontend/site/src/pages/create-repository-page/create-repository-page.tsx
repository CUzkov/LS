import React, { useMemo } from 'react';
import type { FC } from 'react';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { CreateRepositoryForm } from './create-repository-page.form';
import { PageTitle } from 'components/page-title';

import { getPaths } from './create-repository-page.constants';

import styles from './style.scss';

export const CreateRepositoryPage: FC = () => {
    const { username } = useSelector((root) => root.user);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={styles.createRepositoryPage}>
                <PageTitle title={'Создание нового репозитория'} />
                <div className={styles.form}>
                    <CreateRepositoryForm />
                </div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
