import React, { useEffect } from 'react';
import type { FC } from 'react';

import { useLoginUser } from '../../actions';
import { useDispatch } from '../../store';

// interface IHeaderProps {}

export const Header: FC = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        useLoginUser(dispatch, { email: '', password: 'awdawd', username: 'cuzkov' });
        console.log(123);
    }, []);

    return <div></div>;
};
