export type ChangeGroupR = {
    change_group: boolean;
};

export type ChangeGroupQP = [number, string, boolean];

export const changeGroupQ = 'SELECT * from change_group($1, $2, $3)';
