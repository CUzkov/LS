import { CheckAuthRD } from '@api-types/auth/check-auth';
import { LoginUserD, LoginUserRD } from '@api-types/auth/login-user';

import { ResponseCallback, Empty, Code } from '../types';
import { getOkResponse, getServerErrorResponse } from '../utils/server-utils';
import { User, UserFns } from '../models';
import { redis } from '../database';
import { ServerError, errorNames } from '../utils/server-error';

const UNIX_MOUNTH = 60 * 60 * 24 * 30;

export const loginUser: ResponseCallback<LoginUserD, Empty> = async ({ response, data, cookies }) => {
    if ((!data?.email && !data?.username) || !data?.password) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'email или username и password являются обязательными полями!',
            }),
        );
    }

    let user: User;

    try {
        user = data?.email ? await UserFns.getUserByEmail(data.email) : await UserFns.getUserByUsername(data.username);
    } catch (error) {
        if (error instanceof ServerError) {
            if (error.name === errorNames.noSuchUser404) {
                error.fieldError = {
                    error: 'такого пользователя не существует',
                    fieldName: 'emailOrUsername',
                };
            }

            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }

    if (data.password !== user.u_password) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.incorrectPassword,
                code: Code.badRequest,
                fieldError: {
                    error: 'неверный пароль',
                    fieldName: 'password',
                },
            }),
        );
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
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    try {
        const user = await UserFns.getUserById(userId);
        getOkResponse<CheckAuthRD>(response, user);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
