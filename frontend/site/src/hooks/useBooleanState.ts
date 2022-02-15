import { useCallback, useState } from 'react';

type UseBooleanStateReturn = [boolean, () => void, () => void, () => void];

export const useBooleanState = (defaultValue: boolean): UseBooleanStateReturn => {
    const [isTrue, setIsTrue] = useState(defaultValue);

    const setTrue = useCallback(() => {
        setIsTrue(true);
    }, []);

    const setFalse = useCallback(() => {
        setIsTrue(false);
    }, []);

    const toggle = useCallback(() => {
        setIsTrue((prev) => !prev);
    }, []);

    return [isTrue, setTrue, setFalse, toggle];
};
