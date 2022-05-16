import { ResponseCallback, Empty, Code } from '../../types';
import { getOkResponse, getServerErrorResponse } from '../../utils/server-utils';
import { UserFns } from '../../models';
import { ServerError, errorNames } from '../../utils/server-error';

type CheckAuthRD = {
    id: number;
    username: string;
    email: string;
    isAdmin: boolean;
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
        getOkResponse<CheckAuthRD>(response, {
            email: user.email,
            id: user.id,
            isAdmin: user.isAdmin,
            username: user.username,
        });
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
