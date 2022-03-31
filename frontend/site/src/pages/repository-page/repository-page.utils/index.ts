import {EditorActions} from '../repository-page.types'

export const getDirKeyByPath = (pathToFile: string[]) => {
    return pathToFile.join('~');
};

export const getDirPathByKey = (key?: string | null) => {
    return key?.split('~') || [];
};

export const getWsResponse = (messageId: string, action: EditorActions, message: string) => {
    return [messageId, action, message].join('~');
}
