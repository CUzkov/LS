import React, { useEffect, FC } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { checkAuth } from 'actions/user';
import { useSelector } from 'store/store';
import { Header } from 'components/Header';
import {
    getMainPage,
    // getAllMaps,
    // getUserPage,
    // getMapCreate,
    getRepositoryCreate,
    getAllRepositories,
    getRepositoryTemplate,
} from 'constants/routers';
import { Logger } from 'components/Logger';
import { MovablePopupManager } from 'components/movable-popup-manager';

import {
    LoginPage,
    MainPage,
    // MapsListPage,
    // UserPage,
    // CreateMapPage,
    CreateRepositoryPage,
    RepositoriesListPage,
    RepositoryPage,
} from 'pages';
import { FetchStatus } from 'types';

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
                    <Route path={getMainPage} element={<MainPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    {/* <Route path={getAllMaps(userStore.username)} element={<MapsListPage />} /> */}
                    {/* <Route path={getUserPage(userStore.username)} element={<UserPage />} /> */}
                    {/* <Route path={getMapCreate(userStore.username)} element={<CreateMapPage />} /> */}
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
