import { ErrorMessage } from 'App/types';

export const REQUEST_DFSPS = 'DFSPs / Request DFSPs';
export const SET_DFSPS = 'DFSPs / Set DFSPs';
export const SET_DFSPS_ERROR = 'DFSPs / Set DFSPs Error';

export interface DFSP {
  id: number;
  name: string;
}

export interface DFSPsState {
  dfsps: DFSP[];
  dfspsError: ErrorMessage;
  isDfspsPending: boolean;
}
