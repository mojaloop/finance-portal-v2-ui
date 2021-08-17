import { createAction } from '@reduxjs/toolkit';
import {
  RESET_SETTLEMENT_WINDOWS,
  REQUEST_SETTLEMENT_WINDOWS,
  SET_SETTLEMENT_WINDOWS,
  SET_SETTLEMENT_WINDOWS_ERROR,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
  SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTERS,
  CHECK_SETTLEMENT_WINDOWS,
  SETTLE_SETTLEMENT_WINDOWS,
  SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED,
  SET_SETTLE_SETTLEMENT_WINDOWS_ERROR,
  REQUEST_CLOSE_SETTLEMENT_WINDOW,
  SET_CLOSE_SETTLEMENT_WINDOW_FINISHED,
  CLOSE_SETTLEMENT_WINDOW_MODAL,
  SettlementWindow,
  DateRanges,
  FilterNameValue,
} from './types';

export const resetSettlementWindows = createAction(RESET_SETTLEMENT_WINDOWS);
export const requestSettlementWindows = createAction(REQUEST_SETTLEMENT_WINDOWS);
export const setSettlementWindows = createAction<SettlementWindow[]>(SET_SETTLEMENT_WINDOWS);
export const setSettlementWindowsError = createAction<string>(SET_SETTLEMENT_WINDOWS_ERROR);

export const selectSettlementWindowsFilterDateRange = createAction<DateRanges>(
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
);
export const selectSettlementWindowsFilterDateValue = createAction<{
  type: 'start' | 'end';
  value: number;
}>(SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE);
export const clearSettlementWindowsFilterDateRange = createAction(CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE);
export const clearSettlementWindowsFilterState = createAction(CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE);
export const setSettlementWindowsFilterValue = createAction<FilterNameValue>(SET_SETTLEMENT_WINDOWS_FILTER_VALUE);
export const clearSettlementWindowsFilters = createAction(CLEAR_SETTLEMENT_WINDOWS_FILTERS);
export const checkSettlementWindows = createAction<SettlementWindow[]>(CHECK_SETTLEMENT_WINDOWS);
export const settleSettlementWindows = createAction<SettlementWindow[]>(SETTLE_SETTLEMENT_WINDOWS);
export const setSettleSettlementWindowsFinished = createAction<number>(SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED);
export const setSettleSettlementWindowsError = createAction<string>(SET_SETTLE_SETTLEMENT_WINDOWS_ERROR);
export const requestCloseSettlementWindow = createAction<SettlementWindow>(REQUEST_CLOSE_SETTLEMENT_WINDOW);
export const setCloseSettlementWindowFinished = createAction(SET_CLOSE_SETTLEMENT_WINDOW_FINISHED);
export const closeSettlementWindowModal = createAction(CLOSE_SETTLEMENT_WINDOW_MODAL);
