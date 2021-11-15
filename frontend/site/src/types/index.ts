export interface IServerError {
    error: string;
    description: string;
}

export enum FetchStatus {
    successed,
    failed,
    loading,
    none,
}
