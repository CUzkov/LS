import { useEffect, RefObject } from 'react';

export const useOutsideClick = (ref: RefObject<Element>, callback: () => void) => {
    const handleClick = (e) => {
        if (ref.current && !ref.current.contains(e.target)) {
            callback();
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    });
};
