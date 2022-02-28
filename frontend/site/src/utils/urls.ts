import { DOWNLOAD_FILE_URL } from '../actions/urls';

export const getDownloadLink = (repositoryId: number, pathToFile: string) => {
    return `${DOWNLOAD_FILE_URL}?repositoryId=${repositoryId}&pathToFile=${pathToFile}`;
};
