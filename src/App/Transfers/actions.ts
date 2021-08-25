import { createAction } from '@reduxjs/toolkit';
import {
  REQUEST_TRANSFERS,
  // REQUEST_TRANSFERS_ERRORS,
  SET_TRANSFERS,
  SET_IS_TRANSFERS_PENDING,
  SET_TRANSFERS_ERROR,
  SET_TRANSFERS_FILTER_VALUE,
  CLEAR_TRANSFERS_FILTERS,
  SELECT_TRANSFER,
  // SET_TRANSFER_DETAILS,
  // SET_TRANSFER_DETAILS_ERROR,
  // CLOSE_TRANSFER_DETAIL_MODAL,
  Transfer,
  // TransferDetail,
  FilterChangeValue,
} from './types';

export const requestTransfers = createAction(REQUEST_TRANSFERS);
export const setTransfers = createAction<Transfer[]>(SET_TRANSFERS);
export const setTransfersError = createAction<string>(SET_TRANSFERS_ERROR);
export const setTransferFinderFilter = createAction<{ field: string; value: FilterChangeValue }>(
  SET_TRANSFERS_FILTER_VALUE,
);
export const clearTransferFinderFilters = createAction(CLEAR_TRANSFERS_FILTERS);
export const selectTransfer = createAction<Transfer>(SELECT_TRANSFER);
export const setIsTransfersPending = createAction<Boolean>(SET_IS_TRANSFERS_PENDING);
