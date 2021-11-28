import React from 'react';
import type { FC } from 'react';

import { LoginForm } from 'components/LoginForm';
import { cnLoginPage } from './LoginPage.constants';

import './style.scss';

export const LoginPage: FC = () => {
    return (
        <div className={cnLoginPage}>
            <LoginForm />
        </div>
    );
};
