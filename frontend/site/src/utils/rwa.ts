import { RWA } from 'types';

export const getRwaFromFlags = (is_rw: boolean, is_rwa: boolean) => {
    if (is_rw) {
        return RWA.rw;
    }

    if (is_rwa) {
        return RWA.rwa;
    }

    return RWA.r;
};
