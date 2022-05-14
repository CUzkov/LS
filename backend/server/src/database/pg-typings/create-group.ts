import { GroupType } from '../../models/group';

export type CreateGroupR = {
    id: number;
    user_id: number;
    title: string;
    group_type: GroupType;
};

export type CreateGroupQP = [string, GroupType, number, boolean];

export const createGroupQ = 'SELECT * from create_group($1, $2, $3, $4)';
