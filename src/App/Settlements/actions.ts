import { createAction } from '@reduxjs/toolkit';
import {
  REQUEST_SETTLEMENTS,
  SET_SETTLEMENTS,
  SET_SETTLEMENTS_ERROR,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENTS_FILTER_STATE,
  SET_SETTLEMENTS_FILTER_VALUE,
  CLEAR_SETTLEMENTS_FILTERS,
  SELECT_SETTLEMENT,
  SET_SETTLEMENT_REPORT,
  HIDE_FINALIZE_SETTLEMENT_MODAL,
  SHOW_FINALIZE_SETTLEMENT_MODAL,
  FINALIZE_SETTLEMENT,
  FINALIZE_SETTLEMENT_ERROR,
  SET_SETTLEMENT_REPORT_ERROR,
  SET_FINALIZE_PROCESS_NDC,
  SET_FINALIZE_PROCESS_FUNDS_IN_OUT,
  FINALIZING_SETTLEMENT,
  FinalizeSettlementError,
  Settlement,
  SettlementReport,
  DateRanges,
  FilterNameValue,
} from './types';

export const requestSettlements = createAction(REQUEST_SETTLEMENTS);
export const setSettlements = createAction<Settlement[]>(SET_SETTLEMENTS);
export const setSettlementsError = createAction<string>(SET_SETTLEMENTS_ERROR);

export const selectSettlementsFilterDateRange = createAction<DateRanges>(SELECT_SETTLEMENTS_FILTER_DATE_RANGE);
export const selectSettlementsFilterDateValue = createAction<{
  type: 'start' | 'end';
  value: number;
}>(SELECT_SETTLEMENTS_FILTER_DATE_VALUE);
export const clearSettlementsFilterDateRange = createAction(CLEAR_SETTLEMENTS_FILTER_DATE_RANGE);
export const clearSettlementsFilterState = createAction(CLEAR_SETTLEMENTS_FILTER_STATE);
export const setSettlementsFilterValue = createAction<FilterNameValue>(SET_SETTLEMENTS_FILTER_VALUE);
export const clearSettlementsFilters = createAction(CLEAR_SETTLEMENTS_FILTERS);

export const selectSettlement = createAction<null | Settlement>(SELECT_SETTLEMENT);
export const finalizeSettlement =
  createAction<{ settlement: Settlement; report: SettlementReport }>(FINALIZE_SETTLEMENT);
export const setSettlementReport = createAction<null | SettlementReport>(SET_SETTLEMENT_REPORT);
export const setFinalizeSettlementError = createAction<null | FinalizeSettlementError>(FINALIZE_SETTLEMENT_ERROR);
export const setSettlementReportError = createAction<null | string>(SET_SETTLEMENT_REPORT_ERROR);
export const setFinalizingSettlement = createAction<null | Settlement>(FINALIZING_SETTLEMENT);
export const hideFinalizeSettlementModal = createAction(HIDE_FINALIZE_SETTLEMENT_MODAL);
export const showFinalizeSettlementModal = createAction(SHOW_FINALIZE_SETTLEMENT_MODAL);
export const setFinalizeProcessFundsInOut = createAction<boolean>(SET_FINALIZE_PROCESS_FUNDS_IN_OUT);
export const setFinalizeProcessNdc = createAction<boolean>(SET_FINALIZE_PROCESS_NDC);
