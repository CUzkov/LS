import { GroupType } from '../../models/group';

export type GetGroupsByFiltersR = {
    id: number;
    user_id: number;
    title: string;
    group_type: GroupType;
};

export type GetGroupsByFiltersQP = [number, number, string, GroupType, boolean, boolean];

export const getGroupsByFiltersQ = 'SELECT * from get_groups_by_filter($1, $2, $3, $4, $5, $6)';
