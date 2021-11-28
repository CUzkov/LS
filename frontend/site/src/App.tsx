import React, { useEffect } from 'react';
import type { FC } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { checkAuth } from 'actions/user';
import { useDispatch, useSelector } from 'store/store';
import { FetchStatus } from './types';
import { Header } from 'components/Header';

import { getMainPage, getUserMaps } from 'constants/routers';

import { LoginPage, MainPage, MapsListPage } from './pages';

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

    return (
        <div className="page-wrapper">
            <Header />
            <Routes>
                <Route path={getMainPage} element={<MainPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path={getUserMaps(userStore.username)} element={<MapsListPage />} />
            </Routes>
        </div>
    );
};
