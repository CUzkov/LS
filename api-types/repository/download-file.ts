export const DOWNLOAD_FILE_URL = '/api/repository/download';

export type DownloadFileQP = {
    repositoryId: number;
    pathToFile: string;
}
