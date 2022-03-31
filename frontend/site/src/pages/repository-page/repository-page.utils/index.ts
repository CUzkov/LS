export const getDirKeyByPath = (pathToFile: string[]) => {
    return pathToFile.join('~');
};

export const getDirPathByKey = (key?: string | null) => {
    return key?.split('~') || [];
};
