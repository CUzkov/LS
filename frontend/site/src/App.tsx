import React, { useEffect } from 'react';
import type { FC } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { checkAuth } from 'actions/user';
import { useDispatch, useSelector } from 'store/store';
import { Header } from 'components/Header';
import { getMainPage, getUserMaps, getUserPage, getUserMapCreate, getUserRepositoryCreate } from 'constants/routers';
import { Logger } from 'components/Logger';

import { LoginPage, MainPage, MapsListPage, UserPage, CreateMapPage, CreateRepositoryPage } from './pages';
import { FetchStatus } from './types';

import './style.scss';

export const App: FC = () => {
    const dispatch = useDispatch();
    const userStore = useSelector((root) => root.user);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(() => {
        const user = localStorage.getItem('user');

        if (user !== null) {
            dispatch({ type: 'user/success', data: JSON.parse(user) });
        }

        checkAuth(dispatch);
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

    useEffect(() => {
        fetch('/api/repository/change/permitions', {
            method: 'post',
            body: JSON.stringify({
                permitions: [
                    {
                        for_user: 5,
                        is_r: true,
                        is_rw: false,
                        is_rwa: false,
                        repository_id: 5,
                    }
                ]
            })
        })
    }, []);

    return (
        <div className="page-wrapper">
            <Header />
            <Routes>
                <Route path={getMainPage} element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path={getUserMaps(userStore.username)} element={<MapsListPage />} />
                <Route path={getUserPage(userStore.username)} element={<UserPage />} />
                <Route path={getUserMapCreate(userStore.username)} element={<CreateMapPage />} />
                <Route path={getUserRepositoryCreate(userStore.username)} element={<CreateRepositoryPage />} />
            </Routes>
            <div className="logger-wrapper">
                <Logger />
            </div>
        </div>
    );
};
