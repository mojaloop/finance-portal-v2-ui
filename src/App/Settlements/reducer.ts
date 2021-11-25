import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  DateRanges,
  FilterNameValue,
  FinalizeSettlementError,
  Settlement,
  SettlementReport,
  SettlementsState,
} from './types';
import { getDateRangeTimestamp } from './helpers';
import {
  requestSettlements,
  setSettlementsError,
  setSettlements,
  selectSettlementsFilterDateRange,
  selectSettlementsFilterDateValue,
  clearSettlementsFilterDateRange,
  clearSettlementsFilterState,
  setSettlementsFilterValue,
  clearSettlementsFilters,
  selectSettlement,
  setFinalizeSettlementError,
  setFinalizingSettlement,
  setSettlementReport,
  setSettlementReportError,
  showFinalizeSettlementModal,
  hideFinalizeSettlementModal,
  setFinalizeProcessFundsInOut,
  setFinalizeProcessNdc,
} from './actions';

const initialState: SettlementsState = {
  isSettlementsPending: false,
  settlements: [],
  settlementsError: null,

  filters: {
    range: DateRanges.Today,
    start: getDateRangeTimestamp(DateRanges.Today, 'start'),
    end: getDateRangeTimestamp(DateRanges.Today, 'end'),
    state: undefined,
  },

  selectedSettlement: null,

  showFinalizeSettlementModal: false,
  settlementReport: null,
  settlementReportError: null,
  finalizingSettlement: null,
  finalizingSettlementError: null,
  finalizeProcessFundsInOut: true,
  finalizeProcessNdc: true,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(requestSettlements, (state: SettlementsState) => ({
      ...state,
      settlements: initialState.settlements,
      settlementsError: initialState.settlementsError,
      isSettlementsPending: true,
    }))
    .addCase(setSettlements, (state: SettlementsState, action: PayloadAction<Settlement[]>) => ({
      ...state,
      settlements: action.payload,
      isSettlementsPending: false,
    }))
    .addCase(setSettlementsError, (state: SettlementsState, action: PayloadAction<string>) => ({
      ...state,
      settlementsError: action.payload,
      isSettlementsPending: false,
    }))

    .addCase(selectSettlementsFilterDateRange, (state: SettlementsState, action: PayloadAction<DateRanges>) => ({
      ...state,
      filters: {
        ...state.filters,
        range: action.payload,
        start: getDateRangeTimestamp(action.payload, 'start'),
        end: getDateRangeTimestamp(action.payload, 'end'),
      },
    }))
    .addCase(
      selectSettlementsFilterDateValue,
      (state: SettlementsState, action: PayloadAction<{ type: 'start' | 'end'; value: number }>) => {
        const { type, value } = action.payload;
        let { start, end } = state.filters;

        if (type === 'start') {
          start = value;
        } else {
          end = value;
        }

        if ((start || 0) > (end || Infinity)) {
          start = value;
          end = value;
        }

        return {
          ...state,
          filters: {
            ...state.filters,
            range: DateRanges.Custom,
            start,
            end,
          },
        };
      },
    )
    .addCase(clearSettlementsFilterDateRange, (state: SettlementsState) => ({
      ...state,
      filters: {
        ...state.filters,
        range: undefined,
        start: undefined,
        end: undefined,
      },
    }))
    .addCase(clearSettlementsFilterState, (state: SettlementsState) => ({
      ...state,
      filters: {
        ...state.filters,
        state: initialState.filters.state,
      },
    }))
    .addCase(setSettlementsFilterValue, (state: SettlementsState, action: PayloadAction<FilterNameValue>) => ({
      ...state,
      filters: {
        ...state.filters,
        [action.payload.filter as string]: action.payload.value,
      },
    }))
    .addCase(clearSettlementsFilters, (state: SettlementsState) => ({
      ...state,
      filters: initialState.filters,
    }))
    .addCase(selectSettlement, (state: SettlementsState, action: PayloadAction<Settlement | null>) => ({
      ...state,
      selectedSettlement: action.payload,
    }))
    .addCase(setFinalizeSettlementError, (state: SettlementsState, action: PayloadAction<FinalizeSettlementError>) => ({
      ...state,
      finalizingSettlementError: action.payload,
    }))
    .addCase(setFinalizingSettlement, (state: SettlementsState, action: PayloadAction<Settlement>) => ({
      ...state,
      finalizingSettlement: action.payload,
    }))
    .addCase(hideFinalizeSettlementModal, (state: SettlementsState) => ({
      ...state,
      showFinalizeSettlementModal: false,
    }))
    .addCase(showFinalizeSettlementModal, (state: SettlementsState) => ({
      ...state,
      showFinalizeSettlementModal: true,
    }))
    .addCase(setSettlementReport, (state: SettlementsState, action: PayloadAction<SettlementReport>) => ({
      ...state,
      settlementReport: action.payload,
    }))
    .addCase(setSettlementReportError, (state: SettlementsState, action: PayloadAction<string>) => ({
      ...state,
      settlementReportError: action.payload,
    }))
    .addCase(setFinalizeProcessFundsInOut, (state: SettlementsState, action: PayloadAction<boolean>) => ({
      ...state,
      finalizeProcessFundsInOut: action.payload,
    }))
    .addCase(setFinalizeProcessNdc, (state: SettlementsState, action: PayloadAction<boolean>) => ({
      ...state,
      finalizeProcessNdc: action.payload,
    })),
);
