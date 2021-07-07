import { createAction } from '@reduxjs/toolkit';
import { REQUEST_DFSPS, SET_DFSPS, SET_DFSPS_ERROR, DFSP } from './types';

export const requestDfsps = createAction(REQUEST_DFSPS);
export const setDfsps = createAction<DFSP[]>(SET_DFSPS);
export const setDfspsError = createAction<string>(SET_DFSPS_ERROR);
