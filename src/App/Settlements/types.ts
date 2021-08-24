import { ErrorMessage } from 'App/types';

export const REQUEST_SETTLEMENTS = 'Settlements / Request Settlements';
export const SET_SETTLEMENTS = 'Settlements / Set Settlements';
export const SET_SETTLEMENTS_ERROR = 'Settlements / Set Settlements Error';
export const SELECT_SETTLEMENTS_FILTER_DATE_RANGE = 'Settlements / Select Settlements Filter Date Range';
export const SELECT_SETTLEMENTS_FILTER_DATE_VALUE = 'Settlements / Select Settlements Filter Date Value';
export const CLEAR_SETTLEMENTS_FILTER_DATE_RANGE = 'Settlements / Clear Settlements Filter Date Range';
export const CLEAR_SETTLEMENTS_FILTER_STATE = 'Settlements / Clear Settlements Filter State';
export const SET_SETTLEMENTS_FILTER_VALUE = 'Settlements / Set Settlements Filter Value';
export const CLEAR_SETTLEMENTS_FILTERS = 'Settlements / Clear Settlements Filters';

export const SELECT_SETTLEMENT = 'Settlements / Select Settlement';
export const SET_SETTLEMENT_DETAILS = 'Settlements / Set Settlement Details';
export const SET_SETTLEMENT_DETAILS_ERROR = 'Settlements / Set Settlement Details Error';
export const CLOSE_SETTLEMENT_DETAIL_MODAL = 'Settlements / Close Settlement Detail Modal';

export const SELECT_SETTLEMENT_DETAIL = 'Settlements / Select Settlement Detail';
export const SET_SETTLEMENT_DETAIL_POSITIONS = 'Settlements / Set Settlement Detail Positions';
export const SET_SETTLEMENT_DETAIL_POSITIONS_ERROR = 'Settlements / Set Settlement Detail Positions Error';
export const CLOSE_SETTLEMENT_DETAIL_POSITIONS_MODAL = 'Settlements / Close Settlement Detail Positions Modal';

export interface Settlement {
  id: string;
  state: SettlementStatus;
  participants: number[];
  amounts: number[];
  totalValue: number;
  totalVolume: number;
  createdDate: string;
  changedDate: string;
}

export interface SettlementDetail {
  id: string;
  settlementId: string;
  dfspId: number;
  debit: number;
  credit: number;
}

export interface SettlementDetailPosition {
  id: string;
  detailId: string;
  dfsp: string;
  debit: number;
  credit: number;
}

export enum SettlementStatus {
  PendingSettlement = 'PENDING_SETTLEMENT',
  PsTransfersRecorded = 'PS_TRANSFERS_RECORDED',
  PsTransfersReserved = 'PS_TRANSFERS_RESERVED',
  PsTransfersCommitted = 'PS_TRANSFERS_COMMITTED',
  Settling = 'SETTLING',
  Settled = 'SETTLED',
  Aborted = 'ABORTED',
}

export enum DateRanges {
  Today = 'Today',
  TwoDays = 'Past 48 Hours',
  OneWeek = '1 Week',
  OneMonth = '1 Month',
  Custom = 'Custom Range',
}

export interface SettlementFilters {
  range?: DateRanges;
  state?: string;
  start?: number;
  end?: number;
}

export interface SettlementsState {
  settlements: Settlement[];
  settlementsError: ErrorMessage;
  isSettlementsPending: boolean;
  filters: SettlementFilters;

  selectedSettlement?: Settlement;
  settlementDetails: SettlementDetail[];
  settlementDetailsError: ErrorMessage;
  isSettlementDetailsPending: boolean;

  selectedSettlementDetail?: SettlementDetail;
  isSettlementDetailPositionsPending: boolean;
  settlementDetailPositions: SettlementDetailPosition[];
  settlementDetailPositionsError: ErrorMessage;
}

export type FilterValue = null | boolean | undefined | string | number;

export interface FilterNameValue {
  [name: string]: FilterValue;
}
