export const IsNoneEmptyStr = (value: string | undefined | null) => {
    if (value !== undefined && value !== '' && value !== null) {
        return true;
    }

    return false;
};
