import React, { FC, useCallback, ReactNode, useEffect } from 'react';
import { Form, FormSpy, useField } from 'react-final-form';
import { useQueryParams } from 'use-query-params';
import cn from 'classnames';

import { useSelector } from 'store/store';
import { changeFilesDirPath, getFilesByPath, setRepositoryVersion } from 'actions/repository-page';
import SpinnerIcon from 'assets/spinner.svg';
import { SelectField } from 'small-components/Fields';
import { noop } from 'utils/noop';
import { FetchStatus } from 'types';

import { queryParamConfig } from '../repository-page.constants';

import styles from './style.scss';

const RepositoryPageVersionFromInner: FC = () => {
    const { versions, repositoryVersion } = useSelector((root) => root.repositoryPage);
    const [, setQuery] = useQueryParams(queryParamConfig);
    const versioField = useField('version');

    const handleChangeVersion = useCallback(async (version: string) => {
        setQuery({ fullPathToDir: undefined, isEditing: undefined, version: version });
        getFilesByPath([], '', false, version);
        changeFilesDirPath([]);
        setRepositoryVersion(version);
    }, []);

    // костыль что бы не запихивать все кнопки для редактирования в форму
    useEffect(() => {
        versioField.input.onChange(repositoryVersion);
    }, [repositoryVersion]);

    return (
        <form className={styles.versions}>
            <SelectField
                name="version"
                options={versions.map((version) => ({ title: version, value: version }))}
                defaultValue={repositoryVersion}
            />
            <FormSpy
                subscription={{ values: true }}
                render={() => <></>}
                onChange={(form) => {
                    if (repositoryVersion !== form.values['version']) {
                        handleChangeVersion(form.values['version'] as string);
                    }
                }}
            />
        </form>
    );
};

const RepositoryPageVersionFromWrapper: FC<{ children: ReactNode }> = ({ children }) => {
    return <Form onSubmit={noop}>{() => children}</Form>;
};

type RepositoryPageVersionFromProps = {
    isEditing: boolean;
};

export const RepositoryPageVersionFrom: FC<RepositoryPageVersionFromProps> = ({ isEditing }) => {
    const { versions, versionsFetchStatus, repositoryVersion } = useSelector((root) => root.repositoryPage);
    const isShowVersionSpinner =
        versionsFetchStatus === FetchStatus.loading || versionsFetchStatus === FetchStatus.error;
    const isShowVersions = (isShowVersionSpinner || !!versions.length) && !isEditing && repositoryVersion;

    return (
        <div
            className={cn(
                styles.versionsWrapper,
                isShowVersionSpinner && styles.loading,
                isShowVersions && styles.show,
            )}
        >
            <RepositoryPageVersionFromWrapper>
                <RepositoryPageVersionFromInner />
            </RepositoryPageVersionFromWrapper>
            <div className={cn(styles.versionsSpinner, isShowVersionSpinner && styles.loading)}>
                <SpinnerIcon />
            </div>
        </div>
    );
};
