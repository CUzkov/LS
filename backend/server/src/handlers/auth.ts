import { LoginUserD, LoginUserRD, CheckAuthRD } from '@api-types/auth';

import { ResponseCallback, Empty, ServerError, Code } from '../types';
import {
    getOkResponse,
    getBadRequestResponse,
    getInternalServerErrorResponse,
    getServerErrorResponse,
} from '../utils/server-utils';
import { User, UserFns } from '../models';
import { redis } from '../database';

const UNIX_MOUNTH = 60 * 60 * 24 * 30;

export const loginUser: ResponseCallback<LoginUserD, Empty> = async ({ response, data, cookies }) => {
    if ((!data?.email && !data?.username) || !data?.password) {
        return getBadRequestResponse(response, 'Ошибка сериализации', 'Необходимые поля отсутствуют');
    }

    let user: User;

    try {
        user = data?.email ? await UserFns.getUserByEmail(data.email) : await UserFns.getUserByUsername(data.username);
    } catch (error) {
        const e = error as ServerError;
        return getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }

    if (data.password !== user.u_password) {
        return getBadRequestResponse(response, 'Ошибка', 'Неверный пароль', true);
    }

    const newTime = String(new Date().getTime() + UNIX_MOUNTH);
    const userId = user.id;

    redis.set(String(userId), newTime);
    cookies?.set('user_id', String(userId));
    cookies?.set('expired', newTime);

    getOkResponse<LoginUserRD>(response, {
        email: user.email,
        id: Number(user.id),
        is_admin: user.is_admin,
        username: user.username,
    });
};

export const checkAuth: ResponseCallback<Empty, Empty> = async ({ response, userId }) => {
    if (!userId) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'userId не представлен');
    }

    try {
        const user = await UserFns.getUserById(userId);
        getOkResponse<CheckAuthRD>(response, user);
    } catch (error) {
        const e = error as ServerError;
        getServerErrorResponse(response, e.name, e.message, e.code ?? Code.internalServerError);
    }
};
