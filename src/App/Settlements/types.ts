import { ErrorMessage, Currency } from 'App/types';

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
export const FINALIZE_SETTLEMENT = 'Settlements / Finalize Settlement';
export const FINALIZE_SETTLEMENT_ERROR = 'Settlements / Finalize Settlement Error';
export const FINALIZING_SETTLEMENT = 'Settlements / Finalizing Settlement';
export const HIDE_FINALIZE_SETTLEMENT_MODAL = 'Settlements / Hide Finalize Settlement Modal';
export const SHOW_FINALIZE_SETTLEMENT_MODAL = 'Settlements / Show Finalize Settlement Modal';

export const SELECT_SETTLEMENT_DETAIL = 'Settlements / Select Settlement Detail';
export const SET_SETTLEMENT_DETAIL_POSITIONS = 'Settlements / Set Settlement Detail Positions';
export const SET_SETTLEMENT_DETAIL_POSITIONS_ERROR = 'Settlements / Set Settlement Detail Positions Error';
export const CLOSE_SETTLEMENT_DETAIL_POSITIONS_MODAL = 'Settlements / Close Settlement Detail Positions Modal';
export const SET_SETTLEMENT_REPORT = 'Settlements / Set Settlement Report';

export type IsActive = 1 | 0;

export type LedgerAccountType = 'INTERCHANGE_FEE' | 'POSITION' | 'SETTLEMENT';

export type FspId = number;
export type FspName = string;
export type AccountId = number;
export type SettlementId = number;

export interface LedgerAccount {
  id: AccountId;
  ledgerAccountType: LedgerAccountType;
  currency: Currency;
  isActive: IsActive;
}

export interface AccountWithPosition extends LedgerAccount {
  value: number;
}

export interface Limit {
  type: 'NET_DEBIT_CAP';
  value: number;
  alarmPercentage: number;
}

export interface Adjustment {
  participant: LedgerParticipant;
  amount: number;
  settlementBankBalance: number;
  positionAccount: AccountWithPosition;
  settlementAccount: AccountWithPosition;
  currentLimit: Limit;
}

export interface LedgerParticipant {
  name: FspName;
  id: string;
  created: string; // This is an annoyingly nested json string. I.e. { "created": "\"2021-08-20T08:27:30.000Z\"" }
  isActive: IsActive;
  accounts: LedgerAccount[];
}

// prettier-ignore
export enum FinalizeSettlementErrorKind {
  PROCESS_ADJUSTMENTS                   = 'Error processing adjustments',
  SET_SETTLEMENT_PS_TRANSFERS_RECORDED  = 'Error attempting to set settlement state to PS_TRANSFERS_RECORDED',
  SET_SETTLEMENT_PS_TRANSFERS_RESERVED  = 'Error attempting to set settlement state to PS_TRANSFERS_RESERVED',
  SET_SETTLEMENT_PS_TRANSFERS_COMMITTED = 'Error attempting to set settlement state to PS_TRANSFERS_COMMITTED',
  SETTLE_ACCOUNTS                       = 'Errors attempting to settle accounts',
}

export interface FinalizeSettlementTransferError {
  apiResponse: MojaloopError;
  participant: LedgerParticipant;
  account: SettlementPositionAccount;
  transferId: string;
}

export interface FinalizeSettlementSettleAccountError {
  apiResponse: MojaloopError;
  participant: LedgerParticipant;
  account: SettlementPositionAccount;
}

// prettier-ignore
export enum FinalizeSettlementProcessAdjustmentsErrorKind {
  SET_NDC_FAILED          = 'Error attempting to set NDC',
  FUNDS_PROCESSING_FAILED = 'Error attempting to process funds in/out',
  BALANCE_UNCHANGED       = 'Balance unchanged after processing funds in/out',
  BALANCE_INCORRECT       = 'Incorrect resulting balance after processing funds in/out',
}

export interface FinalizeSettlementProcessAdjustmentsBaseError {
  adjustment: Adjustment;
}

export interface FinalizeSettlementProcessAdjustmentsRequestError
  extends FinalizeSettlementProcessAdjustmentsBaseError {
  error: MojaloopError;
}

export type FinalizeSettlementProcessAdjustmentsError =
  | {
      type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_INCORRECT;
      value: FinalizeSettlementProcessAdjustmentsBaseError;
    }
  | {
      type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_UNCHANGED;
      value: FinalizeSettlementProcessAdjustmentsBaseError;
    }
  | {
      type: FinalizeSettlementProcessAdjustmentsErrorKind.SET_NDC_FAILED;
      value: FinalizeSettlementProcessAdjustmentsRequestError;
    }
  | {
      type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED;
      value: FinalizeSettlementProcessAdjustmentsRequestError;
    };

export type FinalizeSettlementError =
  | { type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS; value: FinalizeSettlementProcessAdjustmentsError[] }
  | { type: FinalizeSettlementErrorKind.SETTLE_ACCOUNTS; value: FinalizeSettlementSettleAccountError[] }
  | { type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED; value: MojaloopError }
  | { type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED; value: MojaloopError }
  | { type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED; value: MojaloopError };

export interface MojaloopError {
  errorCode: string;
  errorDescription: string;
}

export interface NetSettlementAmount {
  amount: number;
  currency: Currency;
}

export interface SettlementPositionAccount {
  id: number;
  state: SettlementStatus;
  reason: string;
  netSettlementAmount: NetSettlementAmount;
}

export interface SettlementParticipant {
  id: number;
  accounts: SettlementPositionAccount[];
}

export interface Settlement {
  id: string;
  state: SettlementStatus;
  participants: SettlementParticipant[];
  amounts: number[];
  reason: string;
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

  finalizingSettlement: null | Settlement;
  showFinalizeSettlementModal: boolean;
  finalizingSettlementError: null | FinalizeSettlementError;
  settlementReport: null | File;
}

export type FilterValue = null | boolean | undefined | string | number;

export interface FilterNameValue {
  [name: string]: FilterValue;
}
