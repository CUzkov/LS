import { isProduction } from 'env';

export const getFullUrl = (url: string) => {
    return isProduction ? url : `http://localhost:8000${url}`;
};
