export type CheckIsUserCanAddGroupToGroupR = {
    check_is_user_can_add_group_to_group: boolean;
};

export type CheckIsUserCanAddGroupToGroupQP = [number, number, number];

export const checkIsUserCanAddGroupToGroupQ = 'SELECT * from check_is_user_can_add_group_to_group($1, $2, $3)';
