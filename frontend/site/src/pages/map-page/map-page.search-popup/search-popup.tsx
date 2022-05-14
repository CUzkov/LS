import React, { useCallback, useEffect, useState, FC } from 'react';
import { Form, FormSpy, useField } from 'react-final-form';
import cn from 'classnames';

import { MovablePopupManagerContext } from 'components/movable-popup-manager/movable-popup.types';
import { TextField } from 'components/fields';
import { Button } from 'components/button';
import CrossIcon from 'assets/cross.svg';
import SpinnerIcon from 'assets/spinner.svg';
import { useSelector } from 'store';
import { FetchStatus, Group, Repository } from 'types';
import { getMapsByTitle, clearSearched, getRepositoriessByTitle } from 'actions/map-page';
import { useBooleanState } from 'hooks';

import styles from './style.scss';

let ids = 40;

export enum SearchPopupType {
    map = 'map',
    repository = 'repository',
}

type SearchPopupFromContentProps = {
    fieldName: string;
    hasValidationErrors: boolean;
    values: Record<string, unknown>;
    maps: Group[];
    repositories: Repository[];
    type: SearchPopupType;
    setMaps: React.Dispatch<React.SetStateAction<Group[]>>;
    setRepositories: React.Dispatch<React.SetStateAction<Repository[]>>;
    handleSubmit: () => void;
};

const SearchPopupFromContent: FC<SearchPopupFromContentProps> = ({
    fieldName,
    hasValidationErrors,
    values,
    maps,
    repositories,
    type,
    setMaps,
    setRepositories,
    handleSubmit,
}) => {
    const [value, setValue] = useState<string>('');
    const [isFirstRender, , checkFirstRender] = useBooleanState(true);
    const { popupSearchingFetchStatus, searchedMaps, map, searchedRepositories } = useSelector((root) => root.mapPage);
    const [isInputFocus, , , toggleIsInputFocus] = useBooleanState(false);
    const field = useField(fieldName);
    const isSearching = popupSearchingFetchStatus === FetchStatus.loading;
    const isSearchingSuccess = popupSearchingFetchStatus === FetchStatus.successed;
    const isMapPopup = type === SearchPopupType.map;

    const handleSuggestClick = useCallback(
        (i: number, e: React.MouseEvent) => {
            e.stopPropagation();

            if (isMapPopup) {
                setMaps((prev) => [...prev, { ...searchedMaps[i] }]);
            } else {
                setRepositories((prev) => [...prev, { ...searchedRepositories[i] }]);
            }

            clearSearched();
            field.input.onChange('');
        },
        [searchedMaps, isMapPopup],
    );

    const handleCrossClick = useCallback(
        (i: number, e: React.MouseEvent) => {
            e.stopPropagation();

            if (isMapPopup) {
                setMaps((prev) => prev.filter((_, index) => i !== index));
            } else {
                setRepositories((prev) => prev.filter((_, index) => i !== index));
            }
        },
        [isMapPopup],
    );

    useEffect(() => {
        const timerId = setTimeout(() => {
            if (!isFirstRender && value) {
                if (isMapPopup) {
                    getMapsByTitle(
                        value,
                        maps
                            .map((map) => map.id)
                            .concat([map?.id ?? -1, ...(map ? map.childrenGroups.map((group) => group.id) : [])]),
                    );
                } else {
                    getRepositoriessByTitle(
                        value,
                        repositories
                            .map((repository) => repository.id)
                            .concat([...(map ? map.childrenRepositories.map((repository) => repository.id) : [])]),
                    );
                }
            } else {
                clearSearched();
            }
        }, 300);

        return () => {
            clearTimeout(timerId);
        };
    }, [value]);

    useEffect(() => {
        checkFirstRender();

        return () => {
            clearSearched();
        };
    }, []);

    return (
        <>
            <div className={styles.searchPopupField}>
                <TextField
                    type="text"
                    name={fieldName}
                    theme="outlined"
                    onBlur={toggleIsInputFocus}
                    onFocus={toggleIsInputFocus}
                />
                <div className={cn(styles.searchPopupSpinner, isSearching && styles.show)}>
                    <SpinnerIcon />
                </div>
                {!!(isMapPopup ? searchedMaps : searchedRepositories).length && (
                    <div className={styles.suggests}>
                        {(isMapPopup ? searchedMaps : searchedRepositories).map((map, i) => (
                            <div key={i} className={styles.suggest} onClick={(e) => handleSuggestClick(i, e)}>
                                {map.title}
                            </div>
                        ))}
                    </div>
                )}
                {isInputFocus &&
                    (isMapPopup ? searchedMaps : searchedRepositories).length === 0 &&
                    isSearchingSuccess &&
                    values[fieldName] && (
                        <div className={styles.suggests}>
                            <div className={cn(styles.suggest, styles.noInteract)}>{'ничео не найдено'}</div>
                        </div>
                    )}
            </div>
            {(isMapPopup ? maps : repositories) && (
                <div className={styles.selectedMaps}>
                    {(isMapPopup ? maps : repositories).map((entity, i) => (
                        <div className={styles.selectedMap} key={i}>
                            {entity.title}
                            <div className={styles.crossIcon} onClick={(e) => handleCrossClick(i, e)}>
                                <CrossIcon />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className={styles.buttons}>
                <div className={styles.button}>
                    <Button size="m" text="ок" onClick={() => handleSubmit?.()} isDisable={hasValidationErrors} />
                </div>
            </div>
            <FormSpy
                children={<></>}
                subscription={{ values: true }}
                onChange={({ values }) => {
                    if (value !== values[fieldName]) {
                        setValue(values[fieldName]);
                    }
                }}
            />
        </>
    );
};

type SerachPopupContentProps = {
    context: MovablePopupManagerContext;
    text: string;
    resolve: (value: Group[] | Repository[] | PromiseLike<Group[] | Repository[]>) => void;
    id: string;
    type: SearchPopupType;
};

const SearchPopupContent: FC<SerachPopupContentProps> = ({ context, text, resolve, id, type }): JSX.Element => {
    const [maps, setMaps] = useState<Group[]>([]);
    const [repositories, setRepositories] = useState<Repository[]>([]);
    const fieldName = 'field';
    const isMapPopup = type === SearchPopupType.map;

    return (
        <div className={styles.searchInputPopup}>
            <div className={styles.searchInputPopupText}>{text}</div>
            <Form
                onSubmit={() => {
                    resolve(isMapPopup ? maps : repositories);
                    context.removePopup(id);
                }}
                render={({ handleSubmit, hasValidationErrors, values }) => (
                    <SearchPopupFromContent
                        fieldName={fieldName}
                        handleSubmit={handleSubmit}
                        hasValidationErrors={hasValidationErrors}
                        values={values}
                        maps={maps}
                        repositories={repositories}
                        setMaps={setMaps}
                        setRepositories={setRepositories}
                        type={type}
                    />
                )}
            />
        </div>
    );
};

export const mapSearchPopup = (context: MovablePopupManagerContext, text: string, isRequired = true) => {
    const id = String(++ids);

    return new Promise<Group[]>((resolve) => {
        context.addPopup({
            id,
            content: (
                <SearchPopupContent
                    context={context}
                    id={id}
                    resolve={resolve}
                    text={text}
                    type={SearchPopupType.map}
                />
            ),
            isRequired,
            title: (
                <div className={styles.searchPopupHeader}>
                    <div>{'Ввод'}</div>
                    <div
                        className={styles.searchPopupCross}
                        onClick={() => {
                            resolve([]);
                            context.removePopup(id);
                        }}
                    >
                        <CrossIcon />
                    </div>
                </div>
            ),
        });
    });
};

export const repositorySearchPopup = (context: MovablePopupManagerContext, text: string, isRequired = true) => {
    const id = String(++ids);

    return new Promise<Repository[]>((resolve) => {
        context.addPopup({
            id,
            content: (
                <SearchPopupContent
                    context={context}
                    id={id}
                    resolve={resolve}
                    text={text}
                    type={SearchPopupType.repository}
                />
            ),
            isRequired,
            title: (
                <div className={styles.searchPopupHeader}>
                    <div>{'Ввод'}</div>
                    <div
                        className={styles.searchPopupCross}
                        onClick={() => {
                            resolve([]);
                            context.removePopup(id);
                        }}
                    >
                        <CrossIcon />
                    </div>
                </div>
            ),
        });
    });
};
