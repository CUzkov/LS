export interface ICreateMapProps {
    title: string;
}

export interface IFormSpy {
    modifiedSinceLastSubmit: boolean;
    dirtyFieldsSinceLastSubmit: {
        title?: boolean;
    };
}
