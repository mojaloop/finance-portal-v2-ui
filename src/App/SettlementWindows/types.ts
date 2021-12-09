import { ErrorMessage } from 'App/types';

export { Settlement, SettlementStatus } from 'App/types';

export const RESET_SETTLEMENT_WINDOWS = 'Settlement Windows / Reset Settlement Windows';
export const REQUEST_SETTLEMENT_WINDOWS = 'Settlement Windows / Request Settlement Windows';
export const SET_SETTLEMENT_WINDOWS = 'Settlement Windows / Set Settlement Windows';
export const SET_SETTLEMENT_WINDOWS_ERROR = 'Settlement Windows / Set Settlement Windows Error';
export const SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE =
  'Settlement Windows / Select Settlement Windows Filter Date Range';
export const SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE =
  'Settlement Windows / Select Settlement Windows Filter Date Value';
export const CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE =
  'Settlement Windows / Clear Settlement Windows Filter Date Range';
export const CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE = 'Settlement Windows / Clear Settlement Windows Filter State';
export const SET_SETTLEMENT_WINDOWS_FILTER_VALUE = 'Settlement Windows / Set Settlement Windows Filter Value';
export const CLEAR_SETTLEMENT_WINDOWS_FILTERS = 'Settlement Windows / Clear Settlement Windows Filters';
export const CHECK_SETTLEMENT_WINDOWS = 'Settlement Windows / Check Settlement Windows';
export const SETTLE_SETTLEMENT_WINDOWS = 'Settlement Windows / Settle Settlement Windows';
export const SET_SETTLE_SETTLEMENT_WINDOWS_FINISHED = 'Settlement Windows / Set Settle Settlement Windows Finished';
export const SET_SETTLE_SETTLEMENT_WINDOWS_ERROR = 'Settlement Windows / Set Settle Settlement Windows Error';
export const CLOSE_SETTLEMENT_WINDOW_MODAL = 'Settlement Windows / Close Settlement Window Modal';
export const REQUEST_CLOSE_SETTLEMENT_WINDOW = 'Settlement Windows / Request Close Settlement Window';
export const SET_CLOSE_SETTLEMENT_WINDOW_FINISHED = 'Settlement Windows / Set Close Settlement Window Finished';

export interface SettlementWindow {
  settlementWindowId: number;
  state: SettlementWindowStatus;
  createdDate: string;
  changedDate: string;
}

export enum SettlementWindowStatus {
  Open = 'OPEN',
  Closed = 'CLOSED',
  Pending = 'PENDING_SETTLEMENT',
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

export interface SettlementWindowFilters {
  range?: DateRanges;
  state?: string;
  start?: number;
  end?: number;
}

export interface SettlementWindowsState {
  settlementWindows: SettlementWindow[];
  settlementWindowsError: ErrorMessage;
  isSettlementWindowsPending: boolean;
  selectedSettlementWindow?: SettlementWindow;
  filters: SettlementWindowFilters;
  checkedSettlementWindows: SettlementWindow[];
  isSettlementWindowModalVisible: boolean;
  isCloseSettlementWindowPending: boolean;
  isSettleSettlementWindowPending: boolean;
  settleSettlementWindowsError: ErrorMessage;
  settlingWindowsSettlementId: number | null;
}

export type FilterValue = null | boolean | undefined | string | number;

export interface FilterNameValue {
  [name: string]: FilterValue;
}
