const DOWNLOAD_FILE_OR_DIR_URL = '/api/repository/download'; // draft and no draft

export const getDownloadLink = (repositoryId: number, pathToFile: string, fileName: string, isDraft = false) => {
    return `${DOWNLOAD_FILE_OR_DIR_URL}?repositoryId=${repositoryId}&pathToFile=${pathToFile}&fileName=${fileName}&isDraft=${isDraft}`;
};
