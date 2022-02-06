import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

import {
    getPaths,
    cnCreateRepositoryPage,
    cnCreateRepositoryPageForm,
    cnCreateRepositoryPageTitle,
} from './CreateRepositoryPage.constants';
import { PageWrapper } from 'pages/PageWrapper';
import { useSelector } from 'store/store';
import { getUserMaps } from 'constants/routers';
import { CreateRepositoryForm } from 'components/CreateRepositoryForm';

import { FetchStatus } from '../../types';

import './style.scss';

export const CreateRepositoryPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { fetchStatus } = useSelector((root) => root.createMapForm);

    const navigate = useNavigate();

    useEffect(() => {
        if (fetchStatus === FetchStatus.successed) {
            navigate(getUserMaps(username));
            // FIXME очищать fetch статус
        }
    }, [fetchStatus]);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnCreateRepositoryPage}>
                <div className={cnCreateRepositoryPageTitle}>Создание нового репозитория</div>
                <div className={cnCreateRepositoryPageForm}>
                    <CreateRepositoryForm />
                </div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
