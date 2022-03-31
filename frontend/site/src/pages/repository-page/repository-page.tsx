import { useQueryParams } from 'use-query-params';
import React, { useEffect, useMemo, FC, useCallback, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';

import { PageWrapper } from 'pages/PageWrapper';
import { useDispatch, useSelector } from 'store/store';
import { getPageRepositoriesById, getFilesByDirPath } from 'actions/repository-page';
import { useBooleanState } from 'hooks';
import { MovablePopupManagerContext } from 'components/MovablePopupManager';
import { yesNoPopup } from 'constants/popups';
import { rewriteFile, addFile } from 'actions/repository-editor';
import {toBase64} from 'utils/base64'

import { getPaths } from './repository-page.constants';
import { RepositoryPageFilesCard } from './repository-page.files-card';
import { RepositoryPageHeader } from './repository-page.header';
import { getDirPathByKey, getWsResponse } from './repository-page.utils';
import { queryParamConfig } from './repository-page.constants';
import {AddAction, EditorActions, EditorEvents} from './repository-page.types';

import styles from './style.scss';
import { establishWsConnection } from 'utils/ws';

export const RepositoryPage: FC = () => {
    const dispatch = useDispatch();
    const inputRef = useRef<HTMLInputElement>(null);
    const context = useContext(MovablePopupManagerContext);

    const { username } = useSelector((root) => root.user);
    const { repository, files, currentPath} = useSelector((root) => root.repositoryPage);
    const { id } = useParams();

    const [isEditing, , endEditing, toggleEditing] = useBooleanState(false);
    const [query] = useQueryParams(queryParamConfig);

    const handleChangeInput = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            try {
                establishWsConnection(async (ws) => {
                    const filesToAdd = event.target.files;
    
                    if (!filesToAdd?.length) {
                        return;
                    }
        
                    for (let i = 0; i < filesToAdd.length; i++) {
                        const file = filesToAdd.item(i);
                        const messageId = (new Date()).getTime().toString();
        
                        if (!file) {
                            continue;
                        }
        
                        const duplicateFiles =
                            files.filter(({ name, isDir }) => (isDir ? undefined : name) === file.name) ?? [];
    
                        if (duplicateFiles.length) {
                            const isRewrite = await yesNoPopup(
                                context,
                                'Конфликт',
                                `Файл ${file.name} уже существует в данной папке, хотите перезаписать его?`,
                                true,
                            );
        
                            if (isRewrite) {
                                rewriteFile(dispatch, file, duplicateFiles[0]);
                            }
        
                            continue;
                        }
        
                        const message: AddAction = {
                            file: await toBase64(file),
                            fileName: file.name,
                            pathToFile: currentPath,
                            repositoryId: repository?.id ?? -1
                        };
    
                        ws.send(getWsResponse(messageId, EditorActions.ADD_FILE, JSON.stringify(message)))
                    }
                });
            } catch (error) {
                
            }
        },
        [files, currentPath, repository],
    );

    useEffect(() => {
        if (id) {
            getPageRepositoriesById(dispatch, { id: Number(id) });
        }
    }, [id]);

    useEffect(() => {
        getFilesByDirPath(dispatch, { repositoryId: Number(id), pathToDir: query.pathToDir || '' }, currentPath);
        // changeFilesDirPath(dispatch, getDirPathByKey(query.pathToDir));
    }, [query.pathToDir]);

    const additionalPaths = useMemo(
        () => getDirPathByKey(query.pathToDir).map((path) => ({ title: path, url: '' })),
        [query.pathToDir],
    );
    const paths = useMemo(
        () => getPaths(username, repository?.title, String(repository?.id)).concat(additionalPaths),
        [username, repository, additionalPaths],
    );
    const content = useMemo(
        () => (
            <div className={styles.repositoryPage}>
                <RepositoryPageHeader
                    isEditing={isEditing}
                    inputRef={inputRef}
                    endEditing={endEditing}
                    toggleEditing={toggleEditing}
                />
                <div style={{ pointerEvents: 'all' }}>
                    <RepositoryPageFilesCard isEditing={isEditing} />
                </div>
                <input type="file" ref={inputRef} multiple className={styles.fileInput} onChange={handleChangeInput} />
            </div>
        ),
        [repository, files, toggleEditing, isEditing, currentPath],
    );

    return <PageWrapper content={content} paths={paths} />;
};
