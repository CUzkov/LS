import { Code } from '../../types';

export class ServerError {
    readonly code: Code;
    readonly name: string;
    message?: string;
    fieldError?: {
        fieldName: string;
        error: string;
    };

    constructor({
        code,
        name,
        fieldError,
        message,
    }: {
        code?: Code | null | string | number;
        name: string;
        message?: string;
        fieldError?: { fieldName: string; error: string };
    }) {
        this.name = name;
        this.message = message;

        if (fieldError) {
            this.fieldError = { ...fieldError };
        }

        if (!code || typeof code === 'string') {
            this.code = Code.internalServerError;
        } else {
            this.code = Object.values(Code).includes(code) ? code : Code.internalServerError;
        }
    }

    getStringifyError() {
        return JSON.stringify({
            name: this.name,
            ...(this.message ? { message: this.message } : {}),
            ...(this.fieldError ? { fieldError: this.fieldError } : {}),
        });
    }
}

export enum ErrorsTypes {
    readFileError = 'readFileError',
    noSuchUser404 = 'noSuchUser404',
    noSuchUser500 = 'noSuchUser500',
    dbError = 'dbError',
    repositoryNotFoundOrPermissionDenied = 'repositoryNotFoundOrPermissionDenied',
    mapNotFoundOrPermissionDenied = 'mapNotFoundOrPermissionDenied',
    fileNameNotPresent = 'fileNameNotPresent',
    deleteFileError = 'deleteFileError',
    cannotCreateDraftRepositpory = 'cannotCreateDraftRepositpory',
    cannotCheckoutToVersion = 'cannotCheckoutToVersion',
    cannotCreateNewDir = 'cannotCreateNewDir',
    serializeError = 'serializeError',
    incorrectPassword = 'incorrectPassword',
    noUserId = 'noUserId',
    queryParamsError = 'queryParamsError',
    formDataError = 'formDataError',
    fieldValidationError = 'fieldValidationError',
    routerError = 'routerError',
    renameFileOrDir = 'renameFileOrDir',
    unauthorized = 'unauthorized',
    formReadError = 'formReadError',
    groupAccessError = 'groupAccessError',
    noQueryParams = 'noQueryParams',
    getFullGroupByIdError = 'getFullGroupByIdError',
    noData = 'noData',
}

export const errorNames: Record<ErrorsTypes, string> = {
    [ErrorsTypes.readFileError]: 'Ошибка чтения файла!',
    [ErrorsTypes.noSuchUser500]: 'Такого пользователя не существует!',
    [ErrorsTypes.noSuchUser404]: 'Такого пользователя не существует!',
    [ErrorsTypes.dbError]: 'Ошибка обращения к базе данных!',
    [ErrorsTypes.repositoryNotFoundOrPermissionDenied]: 'Репозиторий не найден или доступ закрыт!',
    [ErrorsTypes.fileNameNotPresent]: 'У загружаемого файла нет имени!',
    [ErrorsTypes.deleteFileError]: 'Ошибка удаления файла!',
    [ErrorsTypes.cannotCreateDraftRepositpory]: 'Ошибка при создании draft-репозитория!',
    [ErrorsTypes.cannotCreateNewDir]: 'Ошибка при создании новой папки!',
    [ErrorsTypes.cannotCheckoutToVersion]: 'Ошибка переключения версии репозитория!',
    [ErrorsTypes.serializeError]: 'Ошибка сериализации полей запроса!',
    [ErrorsTypes.incorrectPassword]: 'Некорректный пароль!',
    [ErrorsTypes.noUserId]: 'userId не представлен!',
    [ErrorsTypes.queryParamsError]: 'Ошибка параметров!',
    [ErrorsTypes.formDataError]: 'Ошибка сериализации формы!',
    [ErrorsTypes.fieldValidationError]: 'Ошибка валидации поля!',
    [ErrorsTypes.routerError]: 'Не найден соответствующий роутер!',
    [ErrorsTypes.renameFileOrDir]: 'Ошибка переименования файла или папки!',
    [ErrorsTypes.unauthorized]: 'Вы не авторизованы!',
    [ErrorsTypes.formReadError]: 'Ошибка чтения формы!',
    [ErrorsTypes.groupAccessError]: 'Ошибка доступа к группе!',
    [ErrorsTypes.noQueryParams]: 'Необходимые параметры отсутствуют!',
    [ErrorsTypes.getFullGroupByIdError]: 'Функция getFullGroupByIdError вернула неправильный результат!',
    [ErrorsTypes.noData]: 'Тело запроса обязательно!',
    [ErrorsTypes.mapNotFoundOrPermissionDenied]: 'Карта не найдена или доступ закрыт!',
};
