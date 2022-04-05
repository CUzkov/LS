import React, { FC, RefObject, useCallback, useContext, useEffect } from 'react';
import { Form } from 'react-final-form';
import { useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { useSelector } from 'store/store';
import { PageTitle } from 'components/PageTitle';
import {
    addDirToRepository,
    changeFilesDirPath,
    getAllVersions,
    getFilesByPath,
    saveRepositoryVersion,
} from 'actions/repository-page';
import { MovablePopupManagerContext } from 'components/movable-popup-manager';
import { SelectField } from 'small-components/Fields';
import { textInputPopup } from 'constants/popups';
import SpinnerIcon from 'assets/spinner.svg';
import { noop } from 'utils/noop';

import EditIcon from '../repository-page.assets/edit.svg';
import AddFolderIcon from '../repository-page.assets/add-folder.svg';
import AddFileIcon from '../repository-page.assets/add-file.svg';
import SaveVersionIcon from '../repository-page.assets/save-version.svg';
import { queryParamConfig } from '../repository-page.constants';

import styles from './style.scss';
import { FetchStatus } from 'types';

type RepositoryPageHeaderProps = {
    isEditing: boolean;
    inputRef: RefObject<HTMLInputElement>;
    toggleEditing: () => void;
};

export const RepositoryPageHeader: FC<RepositoryPageHeaderProps> = ({ isEditing, inputRef, toggleEditing }) => {
    const { repository, versions, versionsFetchStatus } = useSelector((root) => root.repositoryPage);
    const [, setQuery] = useQueryParams(queryParamConfig);
    const context = useContext(MovablePopupManagerContext);
    const isShowVersionSpinner =
        versionsFetchStatus === FetchStatus.loading || versionsFetchStatus === FetchStatus.error;
    const isShowVersions = (isShowVersionSpinner || !!versions.length) && !isEditing;

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

        const version = await textInputPopup(context, 'Введите версию', '', true);

        if (!version) {
            return;
        }

        await saveRepositoryVersion(versionSummary, version.split('.').map(Number));

        toggleEditing();
        setQuery({ fullPathToDir: undefined, isEditing: undefined });
        getAllVersions();
        getFilesByPath([], '', false);
        changeFilesDirPath([]);
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
                    <div
                        className={cn(
                            styles.versionsWrapper,
                            isShowVersionSpinner && styles.loading,
                            isShowVersions && styles.show,
                        )}
                    >
                        <Form onSubmit={noop}>
                            {() => (
                                <form className={styles.versions}>
                                    <SelectField
                                        name="version"
                                        options={versions.map((version) => ({ title: version, value: version }))}
                                    />
                                </form>
                            )}
                        </Form>
                        <div className={cn(styles.versionsSpinner, isShowVersionSpinner && styles.loading)}>
                            <SpinnerIcon />
                        </div>
                    </div>
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
