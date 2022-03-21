import { useEffect, RefObject } from 'react';

export const useOutsideClick = (ref: RefObject<Element>, callback: (e: MouseEvent) => void) => {
    const handleClick = (e: MouseEvent) => {
        // @FIXME убрать as
        if (ref.current && !ref.current.contains(e.target as Node)) {
            callback(e);
        }
    };
    useEffect(() => {
        document.addEventListener('click', handleClick);
        return () => {
            document.removeEventListener('click', handleClick);
        };
    });
};
