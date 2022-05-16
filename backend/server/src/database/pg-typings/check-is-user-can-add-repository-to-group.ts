export type CheckIsUserCanAddRepositoryToGroupR = {
    check_is_user_can_add_repository_to_group: boolean;
};

export type CheckIsUserCanAddRepositoryToGroupQP = [number, number, number];

export const checkIsUserCanAddRepositoryToGroupQ =
    'SELECT * from check_is_user_can_add_repository_to_group($1, $2, $3)';
