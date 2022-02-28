export const getMainPage = '/';

export const getUserPage = (username: string) => `/${username}`;

export const getAllMaps = (username: string) => `/${username}/maps`;

export const getAllRepositories = (username: string) => `/${username}/repositories`;

export const getRepository = (username: string, name: string) => `/${username}/repositories/${name}`;
export const getRepositoryTemplate = (username: string) => `/${username}/repositories/:id`;

export const getMapCreate = (username: string) => `/${username}/maps/create`;

export const getRepositoryCreate = (username: string) => `/${username}/repositories/create`;
