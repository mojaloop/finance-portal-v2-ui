import { State } from 'store/types';

export const getSettlements = (state: State) => state.subApp.settlements.settlements;
export const getSettlementsError = (state: State) => state.subApp.settlements.settlementsError;
export const getIsSettlementsPending = (state: State) => state.subApp.settlements.isSettlementsPending;

export const getSettlementsFilters = (state: State) => state.subApp.settlements.filters;

export const getSelectedSettlement = (state: State) => state.subApp.settlements.selectedSettlement;
export const getSettlementDetails = (state: State) => state.subApp.settlements.settlementDetails;

export const getSettlementDetailsError = (state: State) => state.subApp.settlements.settlementDetailsError;
export const getIsSettlementDetailsPending = (state: State) => state.subApp.settlements.isSettlementDetailsPending;
export const getFinalizeSettlementModalVisible = (state: State) => state.subApp.settlements.showFinalizeSettlementModal;
export const getFinalizingSettlement = (state: State) => state.subApp.settlements.finalizingSettlement;
export const getFinalizingSettlementError = (state: State) => state.subApp.settlements.finalizingSettlementError;
export const getSelectedSettlementDetail = (state: State) => state.subApp.settlements.selectedSettlementDetail;
export const getSettlementDetailPositions = (state: State) => state.subApp.settlements.settlementDetailPositions;
export const getSettlementDetailPositionsError = (state: State) =>
  state.subApp.settlements.settlementDetailPositionsError;
export const getIsSettlementDetailPositionsPending = (state: State) =>
  state.subApp.settlements.isSettlementDetailPositionsPending;
