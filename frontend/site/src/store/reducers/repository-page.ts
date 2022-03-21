import { FetchStatus, Repository, FileMeta } from '../../types';

interface IRepositoryPageUpdateRepositoryD {
    repository?: {
        data: Repository;
    };
}

interface IRepositoryPageUpdateFilesD {
    files?: {
        data: FileMeta[];
    };
}

interface IRepositoryPageAddResponseD {
    fileMeta: FileMeta;
    file: File;
    key: string;
}

export type RepositoryPageEvents =
    | { type: 'repository-page/repository/success'; data: IRepositoryPageUpdateRepositoryD }
    | { type: 'repository-page/repository/loading' }
    | { type: 'repository-page/repository/error' }
    | { type: 'repository-page/files/path'; data: string[] }
    | { type: 'repository-page/files/success'; data: IRepositoryPageUpdateFilesD }
    | { type: 'repository-page/files/loading' }
    | { type: 'repository-page/files/error' }
    | { type: 'repository-page/unsaved/add-fantom-file'; data: IRepositoryPageAddResponseD }
    | { type: 'repository-page/unsaved/delete-fantom-file'; data: { key: string } }
    | { type: 'repository-page/unsaved/clear' };

export type RepositoryPageStore = {
    repository: {
        data?: Repository;
        fetchStatus: FetchStatus;
    };
    files: {
        data?: FileMeta[];
        path: string[];
        fetchStatus: FetchStatus;
    };
    unsavedChanges: Record<
        string,
        {
            fileMeta: FileMeta;
            file: File;
        }
    >;
};

const initialState: RepositoryPageStore = {
    repository: {
        data: undefined,
        fetchStatus: FetchStatus.loading,
    },
    files: {
        data: undefined,
        path: [],
        fetchStatus: FetchStatus.loading,
    },
    unsavedChanges: {},
};

export const repositoryPageReducer = (
    state: RepositoryPageStore = initialState,
    event: RepositoryPageEvents,
): RepositoryPageStore => {
    if (event.type === 'repository-page/repository/success') {
        const result = { ...state };

        result.repository = {
            data: event.data.repository?.data,
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'repository-page/repository/loading') {
        const result = { ...state };

        result.repository.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/repository/error') {
        const result = { ...state };

        result.repository.fetchStatus = FetchStatus.error;

        return result;
    }

    if (event.type === 'repository-page/files/success') {
        const result = { ...state };

        result.files = {
            path: result.files.path,
            data: event.data.files?.data,
            fetchStatus: FetchStatus.successed,
        };

        return result;
    }

    if (event.type === 'repository-page/files/loading') {
        const result = { ...state };

        result.files.fetchStatus = FetchStatus.loading;

        return result;
    }

    if (event.type === 'repository-page/files/error') {
        const result = { ...state };

        result.files.fetchStatus = FetchStatus.error;

        return result;
    }

    if (event.type === 'repository-page/files/path') {
        const result = { ...state };

        result.files.path = event.data;

        return result;
    }

    if (event.type === 'repository-page/unsaved/add-fantom-file') {
        const result = { ...state };

        result.unsavedChanges = {
            ...state.unsavedChanges,
            [event.data.key]: { ...event.data },
        };

        return result;
    }

    if (event.type === 'repository-page/unsaved/delete-fantom-file') {
        const result = { ...state };

        delete result.unsavedChanges[event.data.key];

        return result;
    }

    if (event.type === 'repository-page/unsaved/clear') {
        const result = { ...state };

        result.unsavedChanges = {};

        return result;
    }

    return state;
};
