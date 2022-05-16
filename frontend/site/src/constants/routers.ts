export const getMainPage = () => '/';

export const getLoginPage = () => '/login';

export const getUserPage = (username: string) => `/${username}`;

export const getRepositoryCreate = (username: string) => `/${username}/repositories/create`;
export const getRepository = (username: string, id: number) => `/${username}/repositories/${id}`;
export const getRepositoryTemplate = (username: string) => `/${username}/repositories/:id`;
export const getAllRepositories = (username: string) => `/${username}/repositories`;
export const getRepositorySettings = (username: string, id: number) => `/${username}/repositories/${id}/settings`;
export const getRepositorySettingsTemplate = (username: string) => `/${username}/repositories/:id/settings`;

export const getMapCreate = (username: string) => `/${username}/maps/create`;
export const getMap = (username: string, id: number) => `/${username}/maps/${id}`;
export const getMapTemplate = (username: string) => `/${username}/maps/:id`;
export const getAllMaps = (username: string) => `/${username}/maps`;
