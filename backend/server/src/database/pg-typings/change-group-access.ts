export type ChangeGroupAccessR = {
    change_group_access: boolean;
};

export type ChangeGroupAccessQP = [number, number[], string];

export const changeGroupAccessQ = 'SELECT * from change_group_access($1, $2, $3)';
