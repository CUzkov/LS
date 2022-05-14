import React, { useEffect, FC } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { checkAuth } from 'actions/user';
import { useSelector } from 'store/store';
import { Header } from 'components/header';
import {
    getMainPage,
    getAllMaps,
    getMapCreate,
    getRepositoryCreate,
    getAllRepositories,
    getRepositoryTemplate,
    getLoginPage,
    getMapTemplate,
} from 'constants/routers';
import { Logger } from 'components/logger';
import { MovablePopupManager } from 'components/movable-popup-manager';
import { FetchStatus } from 'types';

import {
    LoginPage,
    MainPage,
    MapsListPage,
    CreateMapPage,
    CreateRepositoryPage,
    RepositoriesListPage,
    RepositoryPage,
    MapPage,
} from 'pages';

import styles from './style.scss';

export const App: FC = () => {
    const userStore = useSelector((root) => root.user);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (userStore.fetchStatus === FetchStatus.successed) {
            localStorage.setItem('user', JSON.stringify(userStore));

            if (pathname === '/login') {
                navigate('/');
            }
        }

        if (userStore.fetchStatus === FetchStatus.none) {
            localStorage.clear();
            navigate('/login');
        }
    }, [userStore.fetchStatus, userStore.userId]);

    console.log(1);

    return (
        <div className={styles.pageWrapper}>
            <MovablePopupManager>
                <Header />
                <Routes>
                    <Route path={getMainPage()} element={<MainPage />} />
                    <Route path={getLoginPage()} element={<LoginPage />} />
                    <Route path={getAllMaps(userStore.username)} element={<MapsListPage />} />
                    <Route path={getMapCreate(userStore.username)} element={<CreateMapPage />} />
                    <Route path={getMapTemplate(userStore.username)} element={<MapPage />} />
                    <Route path={getRepositoryCreate(userStore.username)} element={<CreateRepositoryPage />} />
                    <Route path={getAllRepositories(userStore.username)} element={<RepositoriesListPage />} />
                    <Route path={getRepositoryTemplate(userStore.username)} element={<RepositoryPage />} />
                </Routes>
                <div className={styles.loggerWrapper}>
                    <Logger />
                </div>
            </MovablePopupManager>
        </div>
    );
};
