import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import {
  SettlementsState,
  Settlement,
  SettlementDetail,
  SettlementDetailPosition,
  DateRanges,
  FilterNameValue,
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
  setSettlementDetailsError,
  setSettlementDetails,
  selectSettlementDetail,
  closeSettlementDetailsModal,
  setSettlementDetailPositions,
  setSettlementDetailPositionsError,
  closeSettlementDetailPositionsModal,
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

  selectedSettlement: undefined,

  isSettlementDetailsPending: false,
  settlementDetails: [],
  settlementDetailsError: null,

  selectedSettlementDetail: undefined,

  isSettlementDetailPositionsPending: false,
  settlementDetailPositions: [],
  settlementDetailPositionsError: null,
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
    .addCase(selectSettlement, (state: SettlementsState, action: PayloadAction<Settlement>) => ({
      ...state,
      selectedSettlement: action.payload,
      settlementDetails: initialState.settlementDetails,
      settlementDetailsError: initialState.settlementDetailsError,
      isSettlementDetailsPending: true,
    }))
    .addCase(setSettlementDetails, (state: SettlementsState, action: PayloadAction<SettlementDetail[]>) => ({
      ...state,
      settlementDetails: action.payload,
      isSettlementDetailsPending: false,
    }))
    .addCase(setSettlementDetailsError, (state: SettlementsState, action: PayloadAction<string>) => ({
      ...state,
      settlementDetailsError: action.payload,
      isSettlementDetailsPending: false,
    }))
    .addCase(selectSettlementDetail, (state: SettlementsState, action: PayloadAction<SettlementDetail>) => ({
      ...state,
      selectedSettlementDetail: action.payload,
      isSettlementDetailPositionsPending: true,
    }))
    .addCase(closeSettlementDetailsModal, (state: SettlementsState) => ({
      ...state,
      selectedSettlement: initialState.selectedSettlement,
      settlementDetails: initialState.settlementDetails,
      settlementDetailsError: initialState.settlementDetailsError,
    }))
    .addCase(
      setSettlementDetailPositions,
      (state: SettlementsState, action: PayloadAction<SettlementDetailPosition[]>) => ({
        ...state,
        isSettlementDetailPositionsPending: false,
        settlementDetailPositions: action.payload,
      }),
    )
    .addCase(setSettlementDetailPositionsError, (state: SettlementsState, action: PayloadAction<string>) => ({
      ...state,
      isSettlementDetailPositionsPending: false,
      settlementDetailPositionsError: action.payload,
    }))
    .addCase(closeSettlementDetailPositionsModal, (state: SettlementsState) => ({
      ...state,
      selectedSettlementDetail: initialState.selectedSettlementDetail,
      settlementDetailPositions: initialState.settlementDetailPositions,
      settlementDetailPositionsError: initialState.settlementDetailPositionsError,
    })),
);
