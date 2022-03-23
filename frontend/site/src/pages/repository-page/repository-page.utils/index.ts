export const getFantomFileKey = (pathToFile: string[], fileName: string, isDir: boolean) => {
    return (isDir ? '#~' : '') + pathToFile.concat([fileName]).join('~');
};

export const getDirKeyByPath = (pathToFile: string[]) => {
    return pathToFile.join('~');
};

export const getDirPathByKey = (key?: string | null) => {
    return key?.split('~') || [];
};
