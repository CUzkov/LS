import { QueryResult } from 'pg';

import {
    checkIsGroupNameFreeQ,
    CheckIsGroupNameFreeQP,
    CheckIsGroupNameFreeR,
} from '../database/pg-typings/check-is-group-name-free';
import { createGroupQ, CreateGroupQP, CreateGroupR } from '../database/pg-typings/create-group';
import { getFullGroupByIdQ, GetFullGroupByIdQP, GetFullGroupByIdR } from '../database/pg-typings/get-full-group';
import {
    getGroupsByFiltersQ,
    GetGroupsByFiltersQP,
    GetGroupsByFiltersR,
} from '../database/pg-typings/get-groups-by-filters';

import { pg } from '../database';
import { ServerError, errorNames } from '../utils/server-error';
import { Code } from '../types';

export enum GroupType {
    map = 'map',
    rubric = 'rubric',
}

export type Group = {
    id: number;
    title: string;
    type: GroupType;
    userId: number;
};

export type FullGroup = {
    id: number;
    title: string;
    type: GroupType;
    parentId: number;
    children?: FullGroup[];
};

type GroupsFilters = {
    is_rw?: boolean;
    is_rwa?: boolean;
    title?: string;
    by_user?: number;
};

const getGroupWithChilds = (group: FullGroup, nodesAdjList: Record<string, FullGroup[]>): FullGroup => {
    return {
        ...group,
        children: nodesAdjList[group.id]?.map((currGroup) => getGroupWithChilds(currGroup, nodesAdjList)),
    };
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
    createGroup: async (title: string, userId: number, type: GroupType): Promise<Group> => {
        let result: QueryResult<CreateGroupR>;

        try {
            const client = await pg.connect();
            result = await client.query<CreateGroupR, CreateGroupQP>(createGroupQ, [title, type, userId]);
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
        };
    },
    getFullGroupById: async (userId: number, groupId: number) => {
        let result: QueryResult<GetFullGroupByIdR>;

        try {
            const client = await pg.connect();
            result = await client.query<GetFullGroupByIdR, GetFullGroupByIdQP>(getFullGroupByIdQ, [userId, groupId]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        if (!result.rowCount) {
            throw new ServerError({
                name: errorNames.dbError,
                code: Code.badRequest,
                message: 'Группы не существует!',
            });
        }

        const nodesAdjList = result.rows.reduce((acc, curr) => {
            const group = { id: curr.id, title: curr.title, type: curr.group_type, parentId: curr.parent_id };

            if (!acc[curr.parent_id]) {
                acc[curr.parent_id] = [group];
            } else {
                acc[curr.parent_id].push(group);
            }

            return acc;
        }, {} as Record<string, FullGroup[]>);

        return getGroupWithChilds(
            {
                id: result.rows[0].id,
                parentId: result.rows[0].parent_id,
                title: result.rows[0].title,
                type: result.rows[0].group_type,
            },
            nodesAdjList,
        );
    },
    getGroupsByFilters: async ({ by_user, title, is_rw, is_rwa }: GroupsFilters, userId: number): Promise<Group[]> => {
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
            ]);
            client.release();
        } catch (error) {
            const e = error as Error;
            throw new ServerError({ name: errorNames.dbError, code: Code.badRequest, message: e.message });
        }

        return result.rows.map((row) => ({
            id: row.id,
            title: row.title,
            type: row.group_type,
            userId: row.user_id,
        }));
    },
};
