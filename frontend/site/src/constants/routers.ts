export const getMainPage = '/';

export const getUserPage = (username: string) => `/user/${username}`;

export const getUserMaps = (username: string) => `/user/${username}/maps`;

export const getUserMapCreate = (username: string) => `/user/${username}/create/map`;

export const getUserRepositoryCreate = (username: string) => `/user/${username}/create/repository`;
