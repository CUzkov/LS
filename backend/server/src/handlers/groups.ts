import Ajv, { JTDSchemaType } from 'ajv/dist/jtd';

import { ResponseCallback, Empty, Code } from '../types';
import { getOkResponse, getServerErrorResponse } from '../utils/server-utils';
import { ServerError, errorNames } from '../utils/server-error';
import { isCorrectGroupName } from '../utils/paths';
import { FullGroup, Group, GroupFns, GroupType } from '../models/group';

const ajv = new Ajv({ allErrors: true });

type CheckIsGroupNameFreeD = {
    title: string;
    groupType: GroupType;
};

type CheckIsGroupNameFreeRD = {
    isFree: boolean;
};

const CheckIsGroupNameFreeDto = ajv.compile<JTDSchemaType<CheckIsGroupNameFreeD>>({
    properties: {
        title: { type: 'string', nullable: false },
        groupType: { enum: [GroupType.map, GroupType.rubric], nullable: false },
    },
});

export const checkIsGroupNameFree: ResponseCallback<CheckIsGroupNameFreeD, Empty> = async ({
    response,
    userId,
    data,
}) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!CheckIsGroupNameFreeDto(data)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'groupType и title являются обязательными полями!',
            }),
        );
    }

    if (!isCorrectGroupName(data.title)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.fieldValidationError,
                code: Code.badRequest,
                fieldError: { error: 'недопустимые символы в названии', fieldName: 'title' },
            }),
        );
    }

    try {
        const isFree = await GroupFns.checkIsGroupNameFree(data.title, userId, data.groupType as GroupType);
        getOkResponse<CheckIsGroupNameFreeRD>(response, isFree);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};

type CreateGroupD = {
    title: string;
    groupType: GroupType;
};

type CreateGroupRD = Group;

const CreateGroupDto = ajv.compile<JTDSchemaType<CreateGroupD>>({
    properties: {
        title: { type: 'string', nullable: false },
        groupType: { enum: [GroupType.map, GroupType.rubric], nullable: false },
    },
});

export const createGroup: ResponseCallback<CreateGroupD, Empty> = async ({ response, userId, data }) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!CreateGroupDto(data)) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'groupType и title являются обязательными полями!',
            }),
        );
    }

    try {
        const group = await GroupFns.createGroup(data.title, userId, data.groupType);
        getOkResponse<CreateGroupRD>(response, group);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};

type GetFullGroupByIdQP = {
    groupId: number;
};

type GetFullGroupByIdRD = FullGroup;

const GetFullGroupByIdDto = ajv.compile<JTDSchemaType<GetFullGroupByIdQP>>({
    properties: {
        groupId: { type: 'float64', nullable: false },
    },
});

export const getFullGroupById: ResponseCallback<Empty, GetFullGroupByIdQP> = async ({
    response,
    userId,
    queryParams,
}) => {
    if (!userId) {
        return getServerErrorResponse(
            response,
            new ServerError({ name: errorNames.noUserId, code: Code.internalServerError }),
        );
    }

    if (!GetFullGroupByIdDto({ groupId: Number(queryParams?.groupId) })) {
        return getServerErrorResponse(
            response,
            new ServerError({
                name: errorNames.serializeError,
                code: Code.badRequest,
                message: 'groupId является обязательным параметром!',
            }),
        );
    }

    try {
        const fullGroup = await GroupFns.getFullGroupById(userId, queryParams?.groupId ?? -1);
        getOkResponse<GetFullGroupByIdRD>(response, fullGroup);
    } catch (error) {
        if (error instanceof ServerError) {
            return getServerErrorResponse(response, error);
        }

        const e = error as Error;
        return getServerErrorResponse(response, new ServerError({ name: e.name, message: e.message }));
    }
};
