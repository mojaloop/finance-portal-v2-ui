import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import * as types from './types';
import * as actions from './actions';

const initialState: types.TransfersState = {
  transfers: [],
  selectedTransfer: undefined,
  transfersError: null,
  transfersFilter: {
    transferId: undefined,
    payerFspid: undefined,
    payeeFspid: undefined,
    payerIdType: undefined,
    payerIdValue: undefined,
    payeeIdType: undefined,
    payeeIdValue: undefined,
    from: undefined,
    to: undefined,
  },
  isTransfersPending: false,
  isTransferDetailsPending: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(actions.requestTransfers, (state: types.TransfersState) => ({
      ...state,
      transfers: initialState.transfers,
      transfersError: initialState.transfersError,
      isTransfersPending: true,
    }))
    .addCase(actions.setTransfers, (state: types.TransfersState, action: PayloadAction<types.Transfer[]>) => ({
      ...state,
      transfers: action.payload,
      isTransfersPending: false,
    }))
    .addCase(actions.setTransfersError, (state: types.TransfersState, action: PayloadAction<string>) => ({
      ...state,
      transfersError: action.payload,
      isTransfersPending: false,
    }))
    .addCase(
      actions.setTransferFinderFilter,
      (state: types.TransfersState, action: PayloadAction<{ field: string; value: types.FilterChangeValue }>) => {
        const { field, value } = action.payload;

        return {
          ...state,
          transfersFilter: {
            ...state.transfersFilter,
            [field]: value,
          },
        };
      },
    )
    .addCase(actions.clearTransferFinderFilters, (state: types.TransfersState) => ({
      ...state,
      transfersFilter: initialState.transfersFilter,
    }))
    .addCase(
      actions.setTransferDetails,
      (state: types.TransfersState, action: PayloadAction<types.TransferDetail>) => ({
        ...state,
        selectedTransfer: action.payload,
        isTransferDetailsPending: false,
      }),
    )
    .addCase(actions.transferDetailsModalClose, (state: types.TransfersState) => ({
      ...state,
      selectedTransfer: initialState.selectedTransfer,
      isTransferDetailsPending: false,
    }))
    .addCase(actions.selectTransfer, (state: types.TransfersState) => ({
      ...state,
      isTransferDetailsPending: true,
    })),
);
