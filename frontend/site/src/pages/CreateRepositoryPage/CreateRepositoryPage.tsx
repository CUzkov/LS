import React, { useMemo } from 'react';
import type { FC } from 'react';

import { getPaths, cnCreateRepositoryPage, cnCreateRepositoryPageForm } from './CreateRepositoryPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useSelector } from 'store/store';
import { CreateRepositoryForm } from 'components/CreateRepositoryForm';
import { PageTitle } from 'components/PageTitle';

import './style.scss';

export const CreateRepositoryPage: FC = () => {
    const { username } = useSelector((root) => root.user);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnCreateRepositoryPage}>
                <PageTitle title={'Создание нового репозитория'} />
                <div className={cnCreateRepositoryPageForm}>
                    <CreateRepositoryForm />
                </div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
