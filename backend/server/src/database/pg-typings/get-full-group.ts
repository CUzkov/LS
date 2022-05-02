import { GroupType } from '../../models/group';

export type GetFullGroupByIdR = {
    parent_id: number;
    id: number;
    title: string;
    group_type: GroupType;
};

export type GetFullGroupByIdQP = [number, number];

export const getFullGroupByIdQ = 'SELECT * from get_full_group_by_id($1, $2)';
