import { State } from 'store/types';

export const getSelectedSettlementWindow = (state: State) => state.subApp.settlementWindows.selectedSettlementWindow;
export const getSettlementWindows = (state: State) => state.subApp.settlementWindows.settlementWindows;
export const getSettlementWindowsError = (state: State) => state.subApp.settlementWindows.settlementWindowsError;
export const getIsSettlementWindowsPending = (state: State) =>
  state.subApp.settlementWindows.isSettlementWindowsPending;

export const getSettlementWindowsFilters = (state: State) => state.subApp.settlementWindows.filters;
export const getCheckedSettlementWindows = (state: State) => state.subApp.settlementWindows.checkedSettlementWindows;
export const getIsSettlementWindowModalVisible = (state: State) =>
  state.subApp.settlementWindows.isSettlementWindowModalVisible;
export const getIsCloseSettlementWindowPending = (state: State) =>
  state.subApp.settlementWindows.isCloseSettlementWindowPending;
export const getIsSettleSettlementWindowPending = (state: State) =>
  state.subApp.settlementWindows.isSettleSettlementWindowPending;
export const getSettleSettlementWindowsError = (state: State) =>
  state.subApp.settlementWindows.settleSettlementWindowsError;
export const getSettlingWindowSettlementIds = (state: State) =>
  state.subApp.settlementWindows.settlingWindowSettlementIds;
