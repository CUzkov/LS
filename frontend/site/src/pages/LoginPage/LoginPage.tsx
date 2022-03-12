import React from 'react';
import type { FC } from 'react';

import { LoginForm } from 'components/LoginForm';

import styles from './style.scss';

export const LoginPage: FC = () => {
    return (
        <div className={styles.loginPage}>
            <LoginForm />
        </div>
    );
};
