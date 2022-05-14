import { RWA } from '../../utils/access';
import { GroupType } from '../../models/group';

export type GetGroupsByFiltersR = {
    id: number;
    user_id: number;
    title: string;
    group_type: GroupType;
    rows_count: number;
    access: RWA;
    is_private: boolean;
};

export type GetGroupsByFiltersQP = [number, number, string, GroupType, boolean, boolean, number, number, number[]];

export const getGroupsByFiltersQ = 'SELECT * from get_groups_by_filter($1, $2, $3, $4, $5, $6, $7, $8, $9)';
