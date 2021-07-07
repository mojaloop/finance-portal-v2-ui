import { State } from 'store/types';

export const getDfsps = (state: State) => state.subApp.dfsps.dfsps;
export const getDfspsError = (state: State) => state.subApp.dfsps.dfspsError;
export const getIsDfspsPending = (state: State) => state.subApp.dfsps.isDfspsPending;
