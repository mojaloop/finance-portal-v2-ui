import { State } from 'store/types';

export const getSelectedTransfer = (state: State) => state.subApp.transfers.selectedTransfer;
export const getTransfers = (state: State) => state.subApp.transfers.transfers;
export const getTransfersError = (state: State) => state.subApp.transfers.transfersError;
export const getIsTransfersPending = (state: State) => state.subApp.transfers.isTransfersPending;
export const getTransfersFilter = (state: State) => state.subApp.transfers.transfersFilter;
export const getIsTransferDetailsPending = (state: State) => state.subApp.transfers.isTransferDetailsPending;
