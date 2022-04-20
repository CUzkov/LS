export const getMainPage = () => '/';

export const getLoginPage = () => '/login';

export const getUserPage = (username: string) => `/${username}`;

export const getRepositoryCreate = (username: string) => `/${username}/repositories/create`;
export const getRepository = (username: string, name: string) => `/${username}/repositories/${name}`;
export const getRepositoryTemplate = (username: string) => `/${username}/repositories/:id`;
export const getAllRepositories = (username: string) => `/${username}/repositories`;

export const getMapCreate = (username: string) => `/${username}/maps/create`;
export const getMap = (username: string, name: string) => `/${username}/maps/${name}`;
export const getMapTemplate = (username: string) => `/${username}/maps/:id`;
export const getAllMaps = (username: string) => `/${username}/maps`;
