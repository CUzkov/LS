import React, { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { FC } from 'react';

import { cnCreateMapPageTitle, getPaths, cnCreateMapPage, cnCreateMapPageForm } from './CreateMapPage.constants';
import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { CreateMapForm } from 'components/CreateMapForm';
import { getAllMaps } from 'constants/routers';

import { FetchStatus } from '../../types';

import './style.scss';

export const CreateMapPage: FC = () => {
    const { username } = useSelector((root) => root.user);
    const { fetchStatus } = useSelector((root) => root.createMapForm);

    const navigate = useNavigate();

    useEffect(() => {
        if (fetchStatus === FetchStatus.successed) {
            navigate(getAllMaps(username));
            // FIXME очищать fetch статус
        }
    }, [fetchStatus]);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={cnCreateMapPage}>
                <div className={cnCreateMapPageTitle}>Создание новой карты знаний</div>
                <div className={cnCreateMapPageForm}>
                    <CreateMapForm />
                </div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
