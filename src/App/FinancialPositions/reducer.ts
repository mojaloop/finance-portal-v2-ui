import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { FinancialPositionsState, FinancialPosition, FinancialPositionsUpdateAction } from './types';
import {
  requestFinancialPositions,
  setFinancialPositionsError,
  setFinancialPositions,
  selectFinancialPosition,
  closeFinancialPositionUpdateModal,
  submitFinancialPositionUpdateModal,
  setFinancialPositionUpdateAmount,
  setFinancialPositionUpdateAction,
  showFinancialPositionUpdateConfirmModal,
  closeFinancialPositionUpdateConfirmModal,
  submitFinancialPositionUpdateConfirmModal,
  updateFinancialPositionNDCAfterConfirmModal,
} from './actions';

const initialState: FinancialPositionsState = {
  isFinancialPositionsPending: false,
  financialPositions: [],
  financialPositionsError: null,

  selectedFinancialPosition: undefined,
  isFinancialPositionUpdateSubmitPending: false,
  isFinancialPositionUpdateCancelEnabled: true,
  financialPositionUpdateAmount: '',
  selectedFinancialPositionUpdateAction: undefined,
  isShowUpdateFinancialPositionConfirmModal: false,
  isUpdateFinancialPositionNDCAfterConfirmModal: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(requestFinancialPositions, (state: FinancialPositionsState) => ({
      ...state,
      financialPositions: initialState.financialPositions,
      financialPositionsError: initialState.financialPositionsError,
      isFinancialPositionsPending: true,
    }))
    .addCase(setFinancialPositions, (state: FinancialPositionsState, action: PayloadAction<FinancialPosition[]>) => ({
      ...state,
      financialPositions: action.payload,
      isFinancialPositionsPending: false,
    }))
    .addCase(setFinancialPositionsError, (state: FinancialPositionsState, action: PayloadAction<string>) => ({
      ...state,
      financialPositionsError: action.payload,
      isFinancialPositionsPending: false,
    }))
    .addCase(selectFinancialPosition, (state: FinancialPositionsState, action: PayloadAction<FinancialPosition>) => ({
      ...state,
      selectedFinancialPosition: action.payload,
      financialPositionUpdateAmount: initialState.financialPositionUpdateAmount,
      selectedFinancialPositionUpdateAction: initialState.selectedFinancialPositionUpdateAction,
      isFinancialPositionUpdateCancelEnabled: initialState.isFinancialPositionUpdateCancelEnabled,
      isShowUpdateFinancialPositionConfirmModal: initialState.isShowUpdateFinancialPositionConfirmModal,
      isUpdateFinancialPositionNDCAfterConfirmModal: initialState.isUpdateFinancialPositionNDCAfterConfirmModal,
    }))
    .addCase(closeFinancialPositionUpdateModal, (state: FinancialPositionsState) => ({
      ...state,
      selectedFinancialPosition: initialState.selectedFinancialPosition,
      financialPositionUpdateAmount: initialState.financialPositionUpdateAmount,
      selectedFinancialPositionUpdateAction: initialState.selectedFinancialPositionUpdateAction,
      isFinancialPositionUpdateSubmitPending: initialState.isFinancialPositionUpdateSubmitPending,
      isUpdateFinancialPositionNDCAfterConfirmModal: initialState.isUpdateFinancialPositionNDCAfterConfirmModal,
    }))
    .addCase(submitFinancialPositionUpdateModal, (state: FinancialPositionsState) => ({
      ...state,
      isFinancialPositionUpdateCancelEnabled: false,
      isFinancialPositionUpdateSubmitPending: true,
    }))
    .addCase(setFinancialPositionUpdateAmount, (state: FinancialPositionsState, action: PayloadAction<string>) => ({
      ...state,
      financialPositionUpdateAmount: action.payload,
    }))
    .addCase(
      setFinancialPositionUpdateAction,
      (state: FinancialPositionsState, action: PayloadAction<FinancialPositionsUpdateAction>) => ({
        ...state,
        selectedFinancialPositionUpdateAction: action.payload,
        financialPositionUpdateAmount: initialState.financialPositionUpdateAmount,
      }),
    )
    .addCase(showFinancialPositionUpdateConfirmModal, (state: FinancialPositionsState) => ({
      ...state,
      isShowUpdateFinancialPositionConfirmModal: true,
    }))
    .addCase(closeFinancialPositionUpdateConfirmModal, (state: FinancialPositionsState) => ({
      ...state,
      isShowUpdateFinancialPositionConfirmModal: false,
      financialPositionUpdateAmount: initialState.financialPositionUpdateAmount,
    }))
    .addCase(submitFinancialPositionUpdateConfirmModal, (state: FinancialPositionsState) => ({
      ...state,
      isFinancialPositionUpdateSubmitPending: true,
    }))
    .addCase(updateFinancialPositionNDCAfterConfirmModal, (state: FinancialPositionsState) => ({
      ...state,
      isUpdateFinancialPositionNDCAfterConfirmModal: true,
      selectedFinancialPositionUpdateAction: FinancialPositionsUpdateAction.ChangeNetDebitCap,
      isFinancialPositionUpdateSubmitPending: initialState.isFinancialPositionUpdateSubmitPending,
    })),
);
