import { withNaming } from '@bem-react/classname';

export const cn = withNaming({ n: '', e: '-', m: '_' });

export const IsNoneEmptyStr = (value: string | undefined | null) => {
    if (value !== undefined && value !== '' && value !== null) {
        return true;
    }

    return false;
};
