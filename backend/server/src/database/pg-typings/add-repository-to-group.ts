export type AddRepositoryToGroupR = {
    id: number;
};

export type AddRepositoryToGroupQP = [number, number];

export const addRepositoryToGroupQ = 'SELECT * from add_repository_to_group($1, $2)';
