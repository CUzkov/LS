export enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
    none = 'none',
}

export const bitMaskToRWA = (bitMask: string | null, isPrivate: boolean): RWA => {
    switch (bitMask) {
        case '111':
            return RWA.rwa;
        case '110':
            return RWA.rw;
        case '100':
            return RWA.r;
        default:
            return isPrivate ? RWA.none : RWA.r;
    }
};

export const RWAtoBitMask = (rwa: RWA): string => {
    switch (rwa) {
        case RWA.none:
            return '000';
        case RWA.r:
            return '100';
        case RWA.rw:
            return '110';
        default:
            return '111';
    }
};
