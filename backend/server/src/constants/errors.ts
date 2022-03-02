import { ServerError, Code } from '../types';

export enum ErrorsTypes {
    readFileError = 'readFileError',
    noSuchUser404 = 'noSuchUser404',
    noSuchUser500 = 'noSuchUser500',
    dbError = 'dbError',
    repositoryNotFoundOrPermissionDenied = 'repositoryNotFoundOrPermissionDenied',
}

export const errors: Record<ErrorsTypes, (message: string) => ServerError> = {
    [ErrorsTypes.readFileError]: (message: string) => ({
        code: Code.internalServerError,
        name: 'Ошибка чтения файла!',
        message,
    }),
    [ErrorsTypes.noSuchUser500]: (message: string) => ({
        code: Code.internalServerError,
        name: 'Невозможно найти данного пользователя!',
        message,
    }),
    [ErrorsTypes.noSuchUser404]: (message: string) => ({
        code: Code.badRequest,
        name: 'Данного пользователя не существует!',
        message,
    }),
    [ErrorsTypes.dbError]: (message: string) => ({
        code: Code.internalServerError,
        name: 'Ошибка обращения к базе данных!',
        message,
    }),
    [ErrorsTypes.repositoryNotFoundOrPermissionDenied]: (message: string) => ({
        code: Code.permissionDenied,
        name: 'Репозиторий не найден или доступ закрыт!',
        message,
    }),
};
