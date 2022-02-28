import { LoginUserD, LoginUserReturnD, CheckAuthReturnD } from '@api-types/auth';

import { ResponseCallback, Empty } from '../types';
import { getOkResponse, getBadRequestResponse, getInternalServerErrorResponse } from '../utils/server-utils';
import { UserFns } from '../models';
import { redis } from '../database';

const UNIX_MOUNTH = 60 * 60 * 24 * 30;

export const loginUser: ResponseCallback<LoginUserD, Empty> = async ({ response, data, cookies }) => {
    if ((!data?.email && !data?.username) || !data?.password) {
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

    const newTime = String(new Date().getTime() + UNIX_MOUNTH);
    const userId = user.id;

    redis.set(userId, newTime);
    cookies?.set('user_id', userId);
    cookies?.set('expired', newTime);

    getOkResponse<LoginUserReturnD>(response, {
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

    const user = await UserFns.getUserById(userId);

    if (!user) {
        return getInternalServerErrorResponse(response, 'Ошибка сервера', 'user не найден');
    }

    return getOkResponse<CheckAuthReturnD>(response, {
        email: user.email,
        id: user.id,
        is_admin: user.is_admin,
        username: user.username,
    });
};
