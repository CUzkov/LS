import type { Dispatch } from '../store';

export const getMapsListPageAllMaps = async (dispath: Dispatch) => {
    dispath({ type: 'maps-list-page/maps-list/loading' });
};
