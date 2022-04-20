import {GroupType} from '../../models/group'

export type CheckIsGroupNameFreeR = {
    id: number;
};

export type CheckIsGroupNameFreeQP = [string, number, GroupType];

export const checkIsGroupNameFreeQ = 'SELECT * from check_is_group_name_free($1, $2, $3)';
