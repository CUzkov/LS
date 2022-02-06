import { FieldMetaState as _FieldMetaState, FieldInputProps } from 'react-final-form';

interface FieldMetaState<T> extends _FieldMetaState<T> {
    error?: string | undefined;
}

export type FieldMeta<T> = Pick<FieldMetaState<T>, 'touched' | 'active' | 'dirty' | 'error' | 'submitSucceeded'>;

export type FieldProps<T> = {
    meta: FieldMeta<T>;
    input: FieldInputProps<T, HTMLElement>;
};
