import { State } from '../../store/types';

export const getFinancialPositions = (state: State) => state.subApp.financialPositions.financialPositions;

export const getFinancialPositionsError = (state: State) => state.subApp.financialPositions.financialPositionsError;

export const getIsFinancialPositionsPending = (state: State) =>
  state.subApp.financialPositions.isFinancialPositionsPending;

export const getSelectedFinancialPosition = (state: State) => state.subApp.financialPositions.selectedFinancialPosition;

export const getFinancialPositionUpdateAmount = (state: State) =>
  state.subApp.financialPositions.financialPositionUpdateAmount;

export const getIsFinancialPositionUpdateSubmitPending = (state: State) =>
  state.subApp.financialPositions.isFinancialPositionUpdateSubmitPending;

export const getIsFinancialPositionUpdateCancelEnabled = (state: State) =>
  state.subApp.financialPositions.isFinancialPositionUpdateCancelEnabled;

export const getSelectedFinancialPositionUpdateAction = (state: State) =>
  state.subApp.financialPositions.selectedFinancialPositionUpdateAction;

export const getIsShowUpdateFinancialPositionConfirmModal = (state: State) =>
  state.subApp.financialPositions.isShowUpdateFinancialPositionConfirmModal;

export const getIsUpdateFinancialPositionNDCAfterConfirmModal = (state: State) =>
  state.subApp.financialPositions.isUpdateFinancialPositionNDCAfterConfirmModal;
