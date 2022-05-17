export const requiredValidate = (value: unknown): string | undefined => {
    if (value !== undefined && value !== null && value !== '') {
        return undefined;
    }

    return 'обязательное поле';
};

export const emailValidate = (email: string): string | undefined => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) ? undefined : 'неверный формат почты';
};

export const repositoryVersionValidator = (version: string): string | undefined => {
    const re = /^[0-9]+.[0-9]+.[0-9]+$/;
    return re.test(version) ? undefined : 'недопустимый формат версии; пример: 1.0.3';
};

export const entityNameValidator = (str: string) => {
    const re = /^[a-z0-9а-яA-ZА-Я_ ]{1,}$/;
    return re.test(str) ? undefined : 'в названии указаны недопустимые символы';
};

export const fileNameValidator = (str: string) => {
    const re = /^[a-z0-9а-яA-ZА-Я_ .-]{1,}$/;
    return re.test(str) ? undefined : 'в названии указаны недопустимые символы';
};

export type Validator = ((email: string) => string | undefined) | ((password: string) => string | undefined);

export const composeValidators = (...validators: Validator[]) => {
    return (value): string | undefined => {
        return validators.reduce((error, validator) => error ?? validator(value), undefined);
    };
};

export const deleteExtraSpaces = (value: string) => value.replace(/\s+/g, ' ').trim();
