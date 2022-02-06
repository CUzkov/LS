export interface IFormSpy {
    modifiedSinceLastSubmit: boolean;
    dirtyFieldsSinceLastSubmit: {
        title?: boolean;
    };
}
