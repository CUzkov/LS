export enum RWA {
    r = 'r',
    rw = 'rw',
    rwa = 'rwa',
    none = 'none'
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
}
