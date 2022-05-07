export type AddGroupToGroupR = {
    id: number;
};

export type AddGroupToGroupQP = [number, number];

export const addGroupToGroupQ = 'SELECT * from add_group_to_group($1, $2)';
