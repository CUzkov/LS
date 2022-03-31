import React, { FC, RefObject, useCallback } from 'react';
import cn from 'classnames';

import { useDispatch, useSelector } from 'store/store';
import { PageTitle } from 'components/PageTitle';
import { clearChanges } from 'actions/repository-page';

import EditIcon from '../repository-page.assets/edit.svg';
import AddFolderIcon from '../repository-page.assets/add-folder.svg';
import AddFileIcon from '../repository-page.assets/add-file.svg';

import styles from './style.scss';

type RepositoryPageHeaderProps = {
    isEditing: boolean;
    inputRef: RefObject<HTMLInputElement>;
    endEditing: () => void;
    toggleEditing: () => void;
};

export const RepositoryPageHeader: FC<RepositoryPageHeaderProps> = ({
    isEditing,
    inputRef,
    endEditing,
    toggleEditing,
}) => {
    const dispatch = useDispatch();
    const { repository } = useSelector((root) => root.repositoryPage);

    const handleToggleEditing = useCallback(() => {
        if (isEditing) {
            const isCancelEditing = confirm('Вы хотите выйти из режима редактирования и отменить изменения?');

            if (isCancelEditing) {
                endEditing();
                clearChanges(dispatch);
            }

            return;
        }

        toggleEditing();
    }, [toggleEditing, isEditing, dispatch]);

    const handleAddFile = useCallback(() => {
        if (!inputRef.current) {
            return;
        }

        inputRef.current.files = null;
        inputRef.current.value = '';
        inputRef.current.click();
    }, [inputRef]);

    return (
        <PageTitle
            title={repository?.title}
            rightChild={
                <div className={styles.actions}>
                    <div
                        className={cn(styles.editIcon, styles.actionIcon, isEditing && styles.editing)}
                        onClick={handleAddFile}
                    >
                        <AddFileIcon />
                        {'добавить файлы'}
                    </div>
                    <div className={cn(styles.editIcon, styles.actionIcon, isEditing && styles.editing)}>
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
