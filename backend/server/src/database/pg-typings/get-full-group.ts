import { GroupType } from '../../models/group';

export type GetFullGroupByIdR = {
    id: number;
    title: string;
    is_base: boolean;
    group_type: GroupType;
    user_id: number;
    access: string;
    is_private: boolean;
};

export type GetFullGroupByIdQP = [number, number];

export const getFullGroupByIdQ = 'SELECT * from get_full_group_by_id($1, $2)';
