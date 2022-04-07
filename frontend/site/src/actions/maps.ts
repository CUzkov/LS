import { Dispatch } from '../store';

export interface INewMapProps {
    title: string;
}

export const createMap = async (dispath: Dispatch, props: INewMapProps) => {
    dispath({ type: 'create-map-form/loading' });
};
