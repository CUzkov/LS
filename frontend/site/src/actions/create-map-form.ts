import type { Dispatch } from '../store';

import { CreateMapFormErrors } from '../store/reducers/create-map-form';

export const setCreateMapForm = async (dispath: Dispatch, error: CreateMapFormErrors) => {
    dispath({ type: 'create-map-form/error', data: { error } });
};
