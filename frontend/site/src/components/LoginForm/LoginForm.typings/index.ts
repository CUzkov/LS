export interface ILoginFormProps {
    'email-username': string;
    password: string;
}

export interface IFormSpy {
    modifiedSinceLastSubmit: boolean;
    dirtyFieldsSinceLastSubmit: {
        'email-username'?: boolean;
        password?: boolean;
    };
}
