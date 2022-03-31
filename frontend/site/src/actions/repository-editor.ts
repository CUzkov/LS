import { FileMeta } from 'types';
import { Dispatch } from 'store';

export const addFile = async (dispath: Dispatch, file: File) => {
    dispath({ type: 'repository-editor/add-file', data: { file } });
};

export const addDir = async (dispath: Dispatch, dirName: string) => {
    dispath({ type: 'repository-editor/add-file', data: { dirName } });
};

export const rewriteFile = async (dispath: Dispatch, file: File, fileMeta: FileMeta) => {
    dispath({ type: 'repository-editor/rewrite-file', data: { file, fileMeta } });
};

export const renameFileOrDir = async (dispath: Dispatch, newName: string, fileMeta: FileMeta) => {
    dispath({ type: 'repository-editor/rename-file', data: { fileMeta, newName } });
};

export const deleteFileOrDir = async (dispath: Dispatch, fileMeta: FileMeta) => {
    dispath({ type: 'repository-editor/delete-file', data: { fileMeta } });
};
