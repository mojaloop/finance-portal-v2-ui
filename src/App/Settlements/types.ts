import { ErrorMessage, Currency, Settlement, SettlementParticipant, SettlementParticipantAccount } from '../types';

export { Settlement, SettlementStatus, SettlementParticipant, SettlementParticipantAccount } from '../types';

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
export const CLOSE_SETTLEMENT_DETAIL_MODAL = 'Settlements / Close Settlement Detail Modal';
export const FINALIZE_SETTLEMENT = 'Settlements / Finalize Settlement';
export const FINALIZE_SETTLEMENT_ERROR = 'Settlements / Finalize Settlement Error';
export const SET_SETTLEMENT_REPORT_ERROR = 'Settlements / Settlement Report Error';
export const FINALIZING_SETTLEMENT = 'Settlements / Finalizing Settlement';
export const HIDE_FINALIZE_SETTLEMENT_MODAL = 'Settlements / Hide Finalize Settlement Modal';
export const SHOW_FINALIZE_SETTLEMENT_MODAL = 'Settlements / Show Finalize Settlement Modal';
export const SET_FINALIZE_PROCESS_NDC_INCREASES = ' Settlements / Finalize Report / Process Net Debit Cap Increases';
export const SET_FINALIZE_PROCESS_NDC_DECREASES = ' Settlements / Finalize Report / Process Net Debit Cap Decreases';
export const SET_FINALIZE_PROCESS_FUNDS_IN_OUT = ' Settlements / Finalize Report / Process Funds In/Out';
export const SET_FINALIZE_SETTLEMENT_IN_PROGRESS = ' Settlements / Finalize Report / In Progress';
export const SET_SETTLEMENT_ADJUSTMENTS = 'Settlements / Finalize Report / Set Adjustments';
export const SET_SETTLEMENT_REPORT_VALIDATION_WARNINGS = 'Settlements / Finalize Report / Set Validation Warnings';
export const SET_SETTLEMENT_REPORT_VALIDATION_ERRORS = 'Settlements / Finalize Report / Set Validation Errors';
export const VALIDATE_SETTLEMENT_REPORT = 'Settlements / Finalize Report / Validate Report';
export const SET_SETTLEMENT_FINALIZATION_REPORT_VALIDATION_IN_PROGRESS =
  'Settlements / Finalize Report / Validate Report In Progress';

export const SELECT_SETTLEMENT_DETAIL = 'Settlements / Select Settlement Detail';

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
  settlementParticipantAccount: SettlementParticipantAccount;
  settlementParticipant: SettlementParticipant;
}

export interface LedgerParticipant {
  name: FspName;
  id: string;
  created: string; // This is an annoyingly nested json string. I.e. { "created": "\"2021-08-20T08:27:30.000Z\"" }
  isActive: IsActive;
  accounts: LedgerAccount[];
}

export enum SettlementReportValidationKind {
  SettlementIdNonMatching = 'Selected settlement ID does not match report settlement ID',
  TransfersSumNonZero = 'Sum of transfers in the report is non-zero',
  TransferDoesNotMatchNetSettlementAmount = 'Transfer amount does not match net settlement amount',
  BalanceNotAsExpected = 'Balance not modified corresponding to transfer amount',
  AccountsNotPresentInReport = 'Accounts in settlement not present in report',
  ExtraAccountsPresentInReport = 'Accounts in report not present in settlement',
  ReportIdentifiersNonMatching = 'Report identifiers do not match - participant ID, account ID and participant name must match',
  AccountIsIncorrectType = 'Account type should be POSITION',
  NewBalanceAmountInvalid = 'New balance amount not valid for currency',
  TransferAmountInvalid = 'Transfer amount not valid for currency',
  InvalidAccountId = 'Report account ID does not exist in switch',
}

export type MinorUnit = 0 | 2 | 3 | 4 | '.';

export interface CurrencyData {
  alpha: Currency;
  numeric: number;
  minorUnit: MinorUnit;
}

export type SettlementReportValidation =
  | {
      kind: SettlementReportValidationKind.SettlementIdNonMatching;
      data: {
        reportId: number;
        settlementId: number;
      };
    }
  | {
      kind: SettlementReportValidationKind.TransfersSumNonZero;
      data: {
        currency: Currency;
        sum: number;
      };
    }
  | {
      kind: SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount;
      data: {
        entry: SettlementReportEntry;
        account: SettlementParticipantAccount;
      };
    }
  | {
      kind: SettlementReportValidationKind.BalanceNotAsExpected;
      data: {
        entry: SettlementReportEntry;
        reportBalance: number;
        expectedBalance: number;
        transferAmount: number;
        account: AccountWithPosition;
      };
    }
  | {
      kind: SettlementReportValidationKind.AccountsNotPresentInReport;
      data: {
        participant?: FspName;
        account: SettlementParticipantAccount;
      }[];
    }
  | {
      kind: SettlementReportValidationKind.InvalidAccountId;
      data: { entry: SettlementReportEntry };
    }
  | {
      kind: SettlementReportValidationKind.ExtraAccountsPresentInReport;
      data: {
        participant?: FspName;
        entry: SettlementReportEntry;
      };
    }
  | {
      kind: SettlementReportValidationKind.ReportIdentifiersNonMatching;
      data: { entry: SettlementReportEntry };
    }
  | {
      kind: SettlementReportValidationKind.AccountIsIncorrectType;
      data: {
        entry: SettlementReportEntry;
        switchAccount: LedgerAccount;
      };
    }
  | {
      kind: SettlementReportValidationKind.NewBalanceAmountInvalid;
      data: {
        entry: SettlementReportEntry;
        currencyData: CurrencyData;
      };
    }
  | {
      kind: SettlementReportValidationKind.TransferAmountInvalid;
      data: {
        entry: SettlementReportEntry;
        currencyData: CurrencyData;
      };
    };

// prettier-ignore
export enum FinalizeSettlementErrorKind {
  ABORTED_SETTLEMENT                    = 'Attempted to finalize an aborted settlement',
  PROCESS_ADJUSTMENTS                   = 'Error processing adjustments',
  SET_SETTLEMENT_PS_TRANSFERS_RECORDED  = 'Error attempting to set settlement state to PS_TRANSFERS_RECORDED',
  SET_SETTLEMENT_PS_TRANSFERS_RESERVED  = 'Error attempting to set settlement state to PS_TRANSFERS_RESERVED',
  SET_SETTLEMENT_PS_TRANSFERS_COMMITTED = 'Error attempting to set settlement state to PS_TRANSFERS_COMMITTED',
  SETTLE_ACCOUNTS                       = 'Errors attempting to settle accounts',
}

export interface FinalizeSettlementTransferError {
  apiResponse: MojaloopError;
  participant: LedgerParticipant;
  account: SettlementParticipantAccount;
  transferId: string;
}

export interface FinalizeSettlementSettlementParticipantAccountUpdateError {
  apiResponse: MojaloopError;
  participant: LedgerParticipant;
  account: SettlementParticipantAccount;
}

// prettier-ignore
export enum FinalizeSettlementProcessAdjustmentsErrorKind {
  SET_NDC_FAILED                               = 'Error attempting to set NDC',
  FUNDS_PROCESSING_FAILED                      = 'Error attempting to process funds in/out',
  BALANCE_UNCHANGED                            = 'Balance unchanged after processing funds in/out',
  BALANCE_INCORRECT                            = 'Incorrect resulting balance after processing funds in/out',
  SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED = 'Failed to record settlement participant account state',
}

export interface FinalizeSettlementProcessAdjustmentsBaseError {
  adjustment: Adjustment;
}

export interface FinalizeSettlementProcessAdjustmentsRequestError
  extends FinalizeSettlementProcessAdjustmentsBaseError {
  error: MojaloopError;
  request: any;
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
    }
  | {
      type: FinalizeSettlementProcessAdjustmentsErrorKind.SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED;
      value: FinalizeSettlementProcessAdjustmentsRequestError;
    };

export type FinalizeSettlementError =
  | { type: FinalizeSettlementErrorKind.ABORTED_SETTLEMENT }
  | { type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS; value: FinalizeSettlementProcessAdjustmentsError[] }
  | {
      type: FinalizeSettlementErrorKind.SETTLE_ACCOUNTS;
      value: FinalizeSettlementSettlementParticipantAccountUpdateError[];
    }
  | { type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED; value: MojaloopError }
  | { type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED; value: MojaloopError }
  | {
      type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED;
      value: FinalizeSettlementSettlementParticipantAccountUpdateError[];
    };

export interface MojaloopError {
  errorCode: string;
  errorDescription: string;
}

export interface SettlementReportRow {
  rowNumber: number;
  switchIdentifiers: string;
  balance: number;
  transferAmount: number;
}

export interface SettlementReportEntry {
  participant: {
    id: FspId;
    name: FspName;
  };
  positionAccountId: AccountId;
  balance: number;
  transferAmount: number;
  row: SettlementReportRow;
}

export interface SettlementReport {
  settlementId: SettlementId;
  entries: SettlementReportEntry[];
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

export interface SettlementAdjustments {
  debits: Adjustment[];
  credits: Adjustment[];
}

export interface SettlementsState {
  settlements: Settlement[];
  settlementsError: ErrorMessage;
  isSettlementsPending: boolean;
  filters: SettlementFilters;

  selectedSettlement: null | Settlement;

  finalizingSettlement: null | Settlement;
  showFinalizeSettlementModal: boolean;
  finalizingSettlementError: null | FinalizeSettlementError;
  settlementReport: null | SettlementReport;
  settlementReportError: null | string;
  finalizeProcessFundsInOut: boolean;
  finalizeProcessNdcDecreases: boolean;
  finalizeProcessNdcIncreases: boolean;
  settlementFinalizingInProgress: boolean;
  settlementAdjustments: null | SettlementAdjustments;
  settlementReportValidationInProgress: boolean;
  settlementReportValidationWarnings: null | SettlementReportValidation[];
  settlementReportValidationErrors: null | SettlementReportValidation[];
}

export type FilterValue = null | boolean | undefined | string | number;

export interface FilterNameValue {
  [name: string]: FilterValue;
}
