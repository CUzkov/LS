export const requiredValidate = (value: unknown): string | undefined => {
    if (value !== undefined && value !== null && value !== '') {
        return undefined;
    }

    return 'Обязательное поле';
};

export const emailValidate = (email: string): string | undefined => {
    const re =
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase()) ? undefined : 'Неверный формат почты';
};

// export const passwordValidate = (password: string): string | undefined => {
//     const re = /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])/g;
//     return re.test(String(password)) ? undefined : 'store.getState().mainLoc.demo_pass_not_valid_ch';
// };

// export const passwordLengthValidator = (password: string): string | undefined => {
//     const re = /[0-9a-zA-Z!@#$%^&*]{6,}/g;
//     return re.test(String(password)) ? undefined : 'store.getState().mainLoc.demo_pass_not_valid_length';
// };

// export const maxLengthValidator = (: string): string | undefined => {
//     const re = /^.{0,5000}$/;
//     return re.test(legalEntity) ? undefined : 'store.getState().mainLoc.demo_comment_not_valid_length';
// };

export type Validator = ((email: string) => string | undefined) | ((password: string) => string | undefined);

export const composeValidators = (...validators: Validator[]) => {
    return (value): string | undefined => {
        return validators.reduce((error, validator) => error ?? validator(value), undefined);
    };
};
