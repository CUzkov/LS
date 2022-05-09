import React, { FC, RefObject, useCallback, useContext, useEffect } from 'react';
import { useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { useSelector } from 'store/store';
import { PageTitle } from 'components/page-title';
import {
    addDirToRepository,
    changeFilesDirPath,
    getAllVersions,
    getFilesByPath,
    saveRepositoryVersion,
    setRepositoryVersion,
} from 'actions/repository-page';
import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { textInputPopup } from 'constants/popups';
import { repositoryVersionValidator } from 'utils/final-forms';

import EditIcon from '../repository-page.assets/edit.svg';
import AddFolderIcon from '../repository-page.assets/add-folder.svg';
import AddFileIcon from '../repository-page.assets/add-file.svg';
import SaveVersionIcon from '../repository-page.assets/save-version.svg';
import { queryParamConfig } from '../repository-page.constants';
import { RepositoryPageVersionFrom } from '../repository-page.version-form';

import styles from './style.scss';

type RepositoryPageHeaderProps = {
    isEditing: boolean;
    inputRef: RefObject<HTMLInputElement>;
    toggleEditing: () => void;
};

export const RepositoryPageHeader: FC<RepositoryPageHeaderProps> = ({ isEditing, inputRef, toggleEditing }) => {
    const { repository } = useSelector((root) => root.repositoryPage);
    const [, setQuery] = useQueryParams(queryParamConfig);
    const context = useContext(MovablePopupManagerContext);

    const handleToggleEditing = useCallback(() => {
        toggleEditing();
        setQuery({ fullPathToDir: undefined });
        getFilesByPath([], '', !isEditing);
        changeFilesDirPath([]);
    }, [toggleEditing, isEditing]);

    const handleAddFile = useCallback(() => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.files = null;
        inputRef.current.value = '';
        inputRef.current.click();
    }, [inputRef]);

    const handleAddDir = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        const newDirName = await textInputPopup(context, 'Введите имя папки', '', true);

        if (!newDirName) {
            return;
        }

        addDirToRepository(newDirName);
    }, []);

    const handleSaveVersion = useCallback(async (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();

        const versionSummary = await textInputPopup(context, 'Введите описание изменений', '', true);

        if (!versionSummary) {
            return;
        }

        const version = await textInputPopup(context, 'Введите версию', '', true, [repositoryVersionValidator]);

        if (!version) {
            return;
        }

        const versionArray = version.split('.').map(Number);

        const formattedVersion = await saveRepositoryVersion(versionSummary, [
            versionArray[0],
            versionArray[1],
            versionArray[2],
        ]);

        if (!formattedVersion) {
            return;
        }

        toggleEditing();
        setQuery({ fullPathToDir: undefined, isEditing: undefined, version: formattedVersion });
        getAllVersions();
        getFilesByPath([], '', false, formattedVersion);
        changeFilesDirPath([]);
        setRepositoryVersion(formattedVersion);
    }, []);

    useEffect(() => {
        if (repository?.id) {
            getAllVersions();
        }
    }, [repository?.id]);

    return (
        <PageTitle
            title={repository?.title}
            rightChild={
                <div className={styles.actions}>
                    <RepositoryPageVersionFrom isEditing={isEditing} />
                    <div
                        className={cn(styles.editIcon, styles.actionIcon, isEditing && styles.editing)}
                        onClick={handleSaveVersion}
                    >
                        <SaveVersionIcon />
                        {'сохранить версию'}
                    </div>
                    <div
                        className={cn(styles.editIcon, styles.actionIcon, isEditing && styles.editing)}
                        onClick={handleAddFile}
                    >
                        <AddFileIcon />
                        {'добавить файлы'}
                    </div>
                    <div
                        className={cn(styles.editIcon, styles.actionIcon, isEditing && styles.editing)}
                        onClick={handleAddDir}
                    >
                        <AddFolderIcon />
                        {'добавить папку'}
                    </div>
                    <div className={cn(styles.editIcon, isEditing && styles.editing)} onClick={handleToggleEditing}>
                        <EditIcon />
                    </div>
                </div>
            }
        />
    );
};
