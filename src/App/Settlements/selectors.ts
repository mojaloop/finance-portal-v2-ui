import { State } from 'store/types';

export const getSettlements = (state: State) => state.subApp.settlements.settlements;
export const getSettlementsError = (state: State) => state.subApp.settlements.settlementsError;
export const getIsSettlementsPending = (state: State) => state.subApp.settlements.isSettlementsPending;
export const getSettlementReport = (state: State) => state.subApp.settlements.settlementReport;

export const getSettlementsFilters = (state: State) => state.subApp.settlements.filters;

export const getSelectedSettlement = (state: State) => state.subApp.settlements.selectedSettlement;

export const getFinalizeSettlementModalVisible = (state: State) => state.subApp.settlements.showFinalizeSettlementModal;
export const getFinalizingSettlement = (state: State) => state.subApp.settlements.finalizingSettlement;
export const getFinalizingSettlementError = (state: State) => state.subApp.settlements.finalizingSettlementError;
export const getSettlementReportError = (state: State) => state.subApp.settlements.settlementReportError;
