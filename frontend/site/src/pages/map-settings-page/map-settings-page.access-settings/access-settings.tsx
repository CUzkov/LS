import React, { FC, useCallback, useEffect, useState } from 'react';
import { Form, FormSpy, useField } from 'react-final-form';
import cn from 'classnames';

import {
    clearSearchedUsers,
    getUsersByFilters,
    getUsersWithMapAccess,
    addMapAccess,
    changeMapAccess,
} from 'actions/map-settings-page';
import { noop } from 'utils/noop';
import { useSelector } from 'store';
import { SelectField, TextField } from 'components/fields';
import { FetchStatus, RWA, User } from 'types';
import SpinnerIcon from 'assets/spinner.svg';
import { Button } from 'components/button';
import { useBooleanState } from 'hooks';
import CrossIcon from 'assets/cross.svg';

import { options } from '../map-settings-page.constants';

import styles from './style.scss';

type AddUserFormContentProps = {
    searchedUsername: string;
    usersForAdd: User[];
    toggleShowUserForm: () => void;
    handleAddedUserCrossClick: (index: number) => void;
    setUsersForAdd: React.Dispatch<React.SetStateAction<User[]>>;
    setSearchedUsername: React.Dispatch<React.SetStateAction<string>>;
    handleSubmit: () => void;
};

const AddUserFormContent: FC<AddUserFormContentProps> = ({
    searchedUsername,
    usersForAdd,
    toggleShowUserForm,
    setUsersForAdd,
    setSearchedUsername,
    handleAddedUserCrossClick,
    handleSubmit,
}) => {
    const { searchedUsers } = useSelector((root) => root.mapSettingsPage);
    const isSearchingSuccess = searchedUsers.fetchStatus === FetchStatus.successed;
    const isSearching = searchedUsers.fetchStatus === FetchStatus.loading;
    const [isInputFocus, , , toggleIsInputFocus] = useBooleanState(false);
    const usernameField = useField('username');

    const handleUserSuggestClick = useCallback((index: number) => {
        setUsersForAdd((prev) => [...prev, searchedUsers.users[index]]);
        clearSearchedUsers();
        usernameField.input.onChange('');
    }, []);

    return (
        <>
            <div className={styles.fields}>
                <div className={styles.usernameField}>
                    <TextField
                        name="username"
                        type="text"
                        isNoNeedErrors
                        onBlur={toggleIsInputFocus}
                        onFocus={toggleIsInputFocus}
                    />
                    <div className={cn(styles.searchSpinner, isSearching && styles.show)}>
                        <SpinnerIcon />
                    </div>
                    {!!searchedUsers.users.length && (
                        <div className={styles.suggests}>
                            {searchedUsers.users.map((user, i) => (
                                <div key={i} className={styles.suggest} onClick={() => handleUserSuggestClick(i)}>
                                    {user.username}
                                </div>
                            ))}
                        </div>
                    )}
                    {isInputFocus &&
                        searchedUsers.users.length === 0 &&
                        isSearchingSuccess &&
                        usernameField.input.value && (
                            <div className={styles.suggests}>
                                <div className={cn(styles.suggest, styles.noInteract)}>{'ничео не найдено'}</div>
                            </div>
                        )}
                </div>
                <div className={styles.accessSelect}>
                    <SelectField options={options.filter((option) => option.value !== RWA.none)} name="access" />
                </div>
            </div>
            <div className={styles.usersForAdded}>
                {usersForAdd && (
                    <div className={styles.selectedUsers}>
                        {usersForAdd.map((user, i) => (
                            <div className={styles.selectedUser} key={i}>
                                {user.username}
                                <div className={styles.crossIcon} onClick={() => handleAddedUserCrossClick(i)}>
                                    <CrossIcon />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <div className={styles.buttons}>
                <div className={styles.button}>
                    <Button text="отмена" onClick={toggleShowUserForm} />
                </div>
                <div className={styles.button}>
                    <Button text="добавить" onClick={handleSubmit} isDisable={usersForAdd.length === 0} />
                </div>
            </div>
            <FormSpy
                subscription={{ values: true }}
                onChange={({ values }) => {
                    if (values.username !== searchedUsername) {
                        setSearchedUsername(values.username);
                    }
                }}
                children={<></>}
            />
        </>
    );
};

type AccessUserFormProps = {
    userAccess: RWA;
    accesFieldValue: RWA;
    index: number;
};

const AccessUserForm: FC<AccessUserFormProps> = ({ userAccess, accesFieldValue, index }) => {
    const { rwRwaUsers } = useSelector((root) => root.mapSettingsPage);
    const accessField = useField('access');

    const handleAccessChange = useCallback(
        (index: number, value: RWA) => {
            const oldAccess = accesFieldValue;

            if (userAccess !== value) {
                changeMapAccess(value, rwRwaUsers.users[index]).then((result) => {
                    if (!result) {
                        accessField.input.onChange(oldAccess);
                    }
                });
            }
        },
        [rwRwaUsers, accessField, userAccess],
    );

    return (
        <>
            <div className={styles.accessSelect}>
                <SelectField options={options} name="access" defaultValue={userAccess} />
            </div>
            <FormSpy
                subscription={{ values: true }}
                onChange={({ values }) => handleAccessChange(index, values.access)}
                children={<></>}
            />
        </>
    );
};

export const AccessSettings: FC = () => {
    const { map, rwRwaUsers, changeAccessStatus, addAccessFetchStatus } = useSelector((root) => root.mapSettingsPage);
    const { userId } = useSelector((root) => root.user);
    const [isShowAddUserForm, , , toggleShowUserForm] = useBooleanState(true);
    const isLoadingUsers = rwRwaUsers.fetchStatus === FetchStatus.loading;
    const isNoneUsers = rwRwaUsers.fetchStatus === FetchStatus.none;
    const [isFirstRender, , checkFirstRender] = useBooleanState(true);
    const [usersForAdd, setUsersForAdd] = useState<User[]>([]);
    const [searchedUsername, setSearchedUsername] = useState('');

    const handleAddedUserCrossClick = useCallback((index: number) => {
        setUsersForAdd((prev) => prev.filter((_, i) => i !== index));
    }, []);

    const handleAddUsersFormSubmit = useCallback(
        (access: RWA) => {
            addMapAccess(access, usersForAdd).then(() => toggleShowUserForm());
        },
        [usersForAdd],
    );

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (!isFirstRender && searchedUsername) {
                getUsersByFilters(
                    searchedUsername,
                    rwRwaUsers.users
                        .map((user) => user.id)
                        .concat(usersForAdd.map((user) => user.id))
                        .concat([userId, map?.userId ?? -1]),
                );
            } else {
                clearSearchedUsers();
            }
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [searchedUsername]);

    useEffect(() => {
        if (!isShowAddUserForm) {
            setSearchedUsername('');
        }
    }, [isShowAddUserForm]);

    useEffect(() => {
        checkFirstRender();

        return () => {
            clearSearchedUsers();
        };
    }, []);

    useEffect(() => {
        if (map?.id) {
            getUsersWithMapAccess();
        }
    }, [map?.id]);

    return (
        <div className={styles.accessSettings}>
            <div className={cn(styles.content, !isLoadingUsers && !isNoneUsers && styles.show)}>
                <div className={styles.title}>Пользователи с доступом к карте</div>
                <div className={styles.userList}>
                    {isShowAddUserForm ? (
                        <div className={styles.addUser} onClick={toggleShowUserForm}>
                            {'+ добавить пользователей'}
                        </div>
                    ) : (
                        <div
                            className={cn(
                                styles.addUserForm,
                                addAccessFetchStatus === FetchStatus.loading && styles.disable,
                            )}
                        >
                            <Form onSubmit={noop}>
                                {({ values }) => (
                                    <AddUserFormContent
                                        searchedUsername={searchedUsername}
                                        usersForAdd={usersForAdd}
                                        setSearchedUsername={setSearchedUsername}
                                        setUsersForAdd={setUsersForAdd}
                                        toggleShowUserForm={toggleShowUserForm}
                                        handleAddedUserCrossClick={handleAddedUserCrossClick}
                                        handleSubmit={() => handleAddUsersFormSubmit(values.access)}
                                    />
                                )}
                            </Form>
                            <div
                                className={cn(
                                    styles.spinner,
                                    addAccessFetchStatus === FetchStatus.loading && styles.show,
                                )}
                            >
                                <SpinnerIcon />
                            </div>
                        </div>
                    )}
                    {!!rwRwaUsers.users.length &&
                        !isLoadingUsers &&
                        rwRwaUsers.users.map((user, i) => (
                            <div
                                className={cn(
                                    styles.userCard,
                                    user.access === RWA.none && styles.deleting,
                                    // @FIXME сделать по-человечески
                                    changeAccessStatus.some(
                                        (status) =>
                                            status.userId === user.id && status.fetchStatus === FetchStatus.loading,
                                    ) && styles.disable,
                                )}
                                key={i}
                            >
                                <div>{user.username}</div>
                                <Form onSubmit={noop}>
                                    {({ values }) => (
                                        <AccessUserForm
                                            accesFieldValue={values.access}
                                            userAccess={user.access}
                                            index={i}
                                        />
                                    )}
                                </Form>
                                <div
                                    className={cn(
                                        styles.spinner,
                                        // @FIXME сделать по-человечески
                                        changeAccessStatus.some(
                                            (status) =>
                                                status.userId === user.id && status.fetchStatus === FetchStatus.loading,
                                        ) && styles.show,
                                    )}
                                >
                                    <SpinnerIcon />
                                </div>
                            </div>
                        ))}
                </div>
            </div>
            <div className={cn(styles.spinner, (isLoadingUsers || isNoneUsers) && styles.show)}>
                <SpinnerIcon />
            </div>
        </div>
    );
};
