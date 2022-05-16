import { QueryResult } from 'pg';

import {
    checkIsGroupNameFreeQ,
    CheckIsGroupNameFreeQP,
    CheckIsGroupNameFreeR,
} from '../database/pg-typings/check-is-group-name-free';
import { createGroupQ, CreateGroupQP, CreateGroupR } from '../database/pg-typings/create-group';
import { getFullGroupByIdQ, GetFullGroupByIdQP, GetFullGroupByIdR } from '../database/pg-typings/get-full-group';
import { addGroupToGroupQ, AddGroupToGroupQP, AddGroupToGroupR } from '../database/pg-typings/add-group-to-group';
import {
    checkIsUserCanAddGroupToGroupQ,
    CheckIsUserCanAddGroupToGroupQP,
    CheckIsUserCanAddGroupToGroupR,
} from '../database/pg-typings/check-is-user-can-add-group-to-group';
import {
    getGroupsByFiltersQ,
    GetGroupsByFiltersQP,
    GetGroupsByFiltersR,
} from '../database/pg-typings/get-groups-by-filters';
import {
    getRepositoriesByGroupIdQ,
    GetRepositoriesByGroupIdQP,
    GetRepositoriesByGroupIdR,
} from '../database/pg-typings/get-repositories-by-group-id';
import {
    checkIsUserCanAddRepositoryToGroupQ,
    CheckIsUserCanAddRepositoryToGroupQP,
    CheckIsUserCanAddRepositoryToGroupR,
} from '../database/pg-typings/check-is-user-can-add-repository-to-group';
import {
    addRepositoryToGroupQ,
    AddRepositoryToGroupQP,
    AddRepositoryToGroupR,
} from '../database/pg-typings/add-repository-to-group';

import { pg } from '../database';
import { ServerError, errorNames } from '../utils/server-error';
import { Code } from '../types';
import { bitMaskToRWA, RWA } from '../utils/access';

export enum GroupType {
    map = 'map',
    rubric = 'rubric',
}

export type Group = {
    id: number;
    title: string;
    type: GroupType;
    userId: number;
    access: RWA;
};

export type FullGroup = {
    childrenGroups: Group[];
    childrenRepositories: { title: string; id: number; access: RWA }[];
} & Group;

type GroupsFilters = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
    excludeGroupIds?: number[];
    page: number;
    quantity: number;
};

export const GroupFns = {
    checkIsGroupNameFree: async (title: string, userId: number, groupType: GroupType): Promise<{ isFree: boolean }> => {
        let result: QueryResult<CheckIsGroupNameFreeR>;

        try {
            const client = await pg.connect();
            result = await client.query<CheckIsGroupNameFreeR, CheckIsGroupNameFreeQP>(checkIsGroupNameFreeQ, [
                title,
                userId,
                groupType,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (result.rowCount) {
            return { isFree: false };
        }

        return { isFree: true };
    },
    createGroup: async (title: string, userId: number, type: GroupType, isPrivate: boolean): Promise<Group> => {
        let result: QueryResult<CreateGroupR>;

        try {
            const client = await pg.connect();
            result = await client.query<CreateGroupR, CreateGroupQP>(createGroupQ, [title, type, userId, isPrivate]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Группа не создана!',
            });
        }

        const group = result.rows[0];

        return {
            id: group.id,
            title: group.title,
            type: group.group_type,
            userId,
            access: RWA.rwa,
        };
    },
    getFullGroupById: async (userId: number, groupId: number): Promise<FullGroup> => {
        let resultGroups: QueryResult<GetFullGroupByIdR>;

        try {
            const client = await pg.connect();
            resultGroups = await client.query<GetFullGroupByIdR, GetFullGroupByIdQP>(getFullGroupByIdQ, [
                userId,
                groupId,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!resultGroups.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Группы не существует!',
            });
        }

        const baseGroup = resultGroups.rows.filter(({ is_base }) => is_base)?.[0];

        if (!baseGroup) {
            throw new ServerError({ name: errorNames.mapNotFoundOrPermissionDenied, code: Code.badRequest });
        }

        let resultRepositories: QueryResult<GetRepositoriesByGroupIdR>;

        try {
            const client = await pg.connect();
            resultRepositories = await client.query<GetRepositoriesByGroupIdR, GetRepositoriesByGroupIdQP>(
                getRepositoriesByGroupIdQ,
                [userId, groupId],
            );
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return {
            id: baseGroup.id,
            title: baseGroup.title,
            type: baseGroup.group_type,
            userId: baseGroup.user_id,
            access: bitMaskToRWA(baseGroup.access, baseGroup.is_private),
            childrenGroups: resultGroups.rows
                .filter(({ is_base }) => !is_base)
                .map(({ id, group_type, title, user_id, access, is_private }) => ({
                    id,
                    title,
                    type: group_type,
                    userId: user_id,
                    access: bitMaskToRWA(access, is_private),
                })),
            childrenRepositories: resultRepositories.rows.map(({ id, title, access, is_private }) => ({
                id,
                title,
                access: bitMaskToRWA(access, is_private),
            })),
        };
    },
    getGroupsByFilters: async (
        { by_user, title, is_rw, is_rwa, page, quantity, excludeGroupIds = [] }: GroupsFilters,
        userId: number,
    ): Promise<{ count: number; groups: Group[] }> => {
        let result: QueryResult<GetGroupsByFiltersR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetGroupsByFiltersR, GetGroupsByFiltersQP>(getGroupsByFiltersQ, [
                userId,
                by_user ?? -1,
                title ? `${title}%` : '',
                GroupType.map,
                is_rw ?? false,
                is_rwa ?? false,
                page,
                quantity,
                excludeGroupIds,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return {
            groups: result.rows.map((row) => ({
                id: row.id,
                title: row.title,
                type: row.group_type,
                userId: row.user_id,
                access: bitMaskToRWA(row.access, row.is_private),
            })),
            count: Math.ceil(result.rows?.[0]?.rows_count / quantity) ?? 0,
        };
    },
    addGroupToGroup: async (userId: number, parentGroupId: number, childGroupId: number): Promise<void> => {
        let accessResult: QueryResult<CheckIsUserCanAddGroupToGroupR>;

        try {
            const client = await pg.connect();
            accessResult = await client.query<CheckIsUserCanAddGroupToGroupR, CheckIsUserCanAddGroupToGroupQP>(
                checkIsUserCanAddGroupToGroupQ,
                [userId, parentGroupId, childGroupId],
            );
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!accessResult.rows?.[0]?.check_is_user_can_add_group_to_group) {
            throw new ServerError({ name: errorNames.groupAccessError, code: Code.badRequest });
        }

        let result: QueryResult<AddGroupToGroupR>;

        try {
            const client = await pg.connect();
            result = await client.query<AddGroupToGroupR, AddGroupToGroupQP>(addGroupToGroupQ, [
                parentGroupId,
                childGroupId,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Группа не добавлена!',
            });
        }
    },
    addRepositoryToGroup: async (userId: number, repositoryId: number, groupId: number): Promise<void> => {
        let accessResult: QueryResult<CheckIsUserCanAddRepositoryToGroupR>;

        try {
            const client = await pg.connect();
            accessResult = await client.query<
                CheckIsUserCanAddRepositoryToGroupR,
                CheckIsUserCanAddRepositoryToGroupQP
            >(checkIsUserCanAddRepositoryToGroupQ, [userId, repositoryId, groupId]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!accessResult.rows?.[0]?.check_is_user_can_add_repository_to_group) {
            throw new ServerError({ name: errorNames.groupAccessError, code: Code.badRequest });
        }

        let result: QueryResult<AddRepositoryToGroupR>;

        try {
            const client = await pg.connect();
            result = await client.query<AddRepositoryToGroupR, AddRepositoryToGroupQP>(addRepositoryToGroupQ, [
                repositoryId,
                groupId,
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Репозиторий не добавлен!',
            });
        }
    },
};
