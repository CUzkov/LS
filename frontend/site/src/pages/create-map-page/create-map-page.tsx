import React, { useMemo, FC } from 'react';

import { PageWrapper } from 'pages/page-wrapper';
import { useSelector } from 'store/store';
import { PageTitle } from 'components/PageTitle';

import { CreateMapForm } from './create-map-page.form';
import { getPaths } from './create-map-page.constants';

import styles from './style.scss';

export const CreateMapPage: FC = () => {
    const { username } = useSelector((root) => root.user);

    const paths = useMemo(() => getPaths(username), [username]);
    const content = useMemo(
        () => (
            <div className={styles.createMapPage}>
                <PageTitle title={'Создание новой карты знаний'} />
                <div className={styles.form}>
                    <CreateMapForm />
                </div>
            </div>
        ),
        [],
    );

    return <PageWrapper content={content} paths={paths} />;
};
