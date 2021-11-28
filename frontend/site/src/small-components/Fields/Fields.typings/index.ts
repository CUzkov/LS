import { FieldMetaState as _FieldMetaState, FieldInputProps } from 'react-final-form';

interface FieldMetaState<T> extends _FieldMetaState<T> {
    error?: string | undefined;
}

export interface FieldProps<T> {
    meta: Pick<FieldMetaState<T>, 'touched' | 'active' | 'dirty' | 'error' | 'submitSucceeded'>;
    input: FieldInputProps<T, HTMLElement>;
}
