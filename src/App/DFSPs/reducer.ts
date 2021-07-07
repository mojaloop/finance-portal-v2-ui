import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { DFSPsState, DFSP } from './types';
import { requestDfsps, setDfspsError, setDfsps } from './actions';

const initialState: DFSPsState = {
  isDfspsPending: false,
  dfsps: [],
  dfspsError: null,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(requestDfsps, (state: DFSPsState) => ({
      ...state,
      dfsps: initialState.dfsps,
      dfspsError: initialState.dfspsError,
      isDfspsPending: true,
    }))
    .addCase(setDfsps, (state: DFSPsState, action: PayloadAction<DFSP[]>) => ({
      ...state,
      dfsps: action.payload,
      isDfspsPending: false,
    }))
    .addCase(setDfspsError, (state: DFSPsState, action: PayloadAction<string>) => ({
      ...state,
      dfspsError: action.payload,
      isDfspsPending: false,
    })),
);
