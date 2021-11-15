import React from 'react';
import type { FC } from 'react';

import { Header } from './components/Header';

import './style.scss';

export const App: FC = () => {
    return (
        <div className="wrapper">
            <Header />
            <h1>React 17 and TypeScript 4 App!🚀</h1>
        </div>
    );
};
