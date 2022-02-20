import { ResponseCallback } from '../types';
import { getOkResponse, getBadRequestResponse } from '../utils/server_utils';
import { UserFns } from '../models';
import { redis } from '../database';

interface ILoginUserProps {
    username: string;
    password: string;
    email: string;
}

interface ILoginUserReturn {
    id: string;
    username: string;
    email: string;
    u_password: string;
    is_admin: boolean;
}

export const loginUser: ResponseCallback<ILoginUserProps> = async ({ response, data, cookies }) => {
    if ((!data?.email && !data?.username) || !data?.password) {
        console.log(data);
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    const user = data?.email
        ? await UserFns.getUserByEmail(data.email)
        : await UserFns.getUserByUsername(data.username);

    if (!user) {
        return getBadRequestResponse(response, 'Ошибка', 'Такого пользователя не существует!');
    }

    if (data.password !== user.u_password) {
        return getBadRequestResponse(response, 'Ошибка', 'Неверный пароль');
    }

    redis.set('user_id', String(user.id));
    cookies?.set('user_id', String(user.id));
    cookies?.set('expired', String(new Date().getTime()));

    getOkResponse<ILoginUserReturn>(response, user);
};

export const checkAuth: ResponseCallback<Record<string, never>> = async ({ response }) => {
    getOkResponse(response);
};
