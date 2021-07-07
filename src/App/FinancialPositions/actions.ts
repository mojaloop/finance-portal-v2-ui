import { createAction } from '@reduxjs/toolkit';
import {
  REQUEST_FINANCIAL_POSITIONS,
  SET_FINANCIAL_POSITIONS,
  SET_FINANCIAL_POSITIONS_ERROR,
  FinancialPosition,
  SELECT_FINANCIAL_POSITION,
  CLOSE_FINANCIAL_POSITION_UPDATE_MODAL,
  SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL,
  SET_FINANCIAL_POSITION_UPDATE_AMOUNT,
  FinancialPositionsUpdateAction,
  SET_FINANCIAL_POSITION_UPDATE_ACTION,
  SHOW_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL,
  CLOSE_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL,
  SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL,
  UPDATE_FINANCIAL_POSITION_NDC_AFTER_CONFIRM_MODAL,
} from './types';

/** Actions for "DFSP Financial Positions" */
export const requestFinancialPositions = createAction(REQUEST_FINANCIAL_POSITIONS);
export const setFinancialPositions = createAction<FinancialPosition[]>(SET_FINANCIAL_POSITIONS);
export const setFinancialPositionsError = createAction<string>(SET_FINANCIAL_POSITIONS_ERROR);

/** Actions for "DFSP Financial Positions" > "Update" button > "Update Participant" modal */
export const selectFinancialPosition = createAction<FinancialPosition>(SELECT_FINANCIAL_POSITION);
export const closeFinancialPositionUpdateModal = createAction(CLOSE_FINANCIAL_POSITION_UPDATE_MODAL);
export const submitFinancialPositionUpdateModal = createAction(SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL);
export const setFinancialPositionUpdateAmount = createAction<string>(SET_FINANCIAL_POSITION_UPDATE_AMOUNT);
export const setFinancialPositionUpdateAction = createAction<FinancialPositionsUpdateAction>(
  SET_FINANCIAL_POSITION_UPDATE_ACTION,
);

/** Actions for "DFSP Financial Positions" > "Update" button > "Update Participant" modal > "Confirm" modal */
export const showFinancialPositionUpdateConfirmModal = createAction(SHOW_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL);
export const closeFinancialPositionUpdateConfirmModal = createAction(CLOSE_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL);
export const submitFinancialPositionUpdateConfirmModal = createAction(SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL);
export const updateFinancialPositionNDCAfterConfirmModal = createAction(
  UPDATE_FINANCIAL_POSITION_NDC_AFTER_CONFIRM_MODAL,
);
