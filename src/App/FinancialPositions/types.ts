import { ErrorMessage, Currency } from 'App/types';
import { DFSP } from 'App/DFSPs/types';
// Removed because we reverted the version of this package due to a bug
// import { composeOptions } from '@modusbox/modusbox-ui-components/dist/utils/html';

export const REQUEST_FINANCIAL_POSITIONS = 'Financial Positions / Request Financial Positions';
export const SET_FINANCIAL_POSITIONS = 'Financial Positions / Set Financial Positions';
export const SET_FINANCIAL_POSITIONS_ERROR = 'Financial Positions / Set Financial Positions Error';

export const SELECT_FINANCIAL_POSITION = 'Financial Positions / Select Financial Position';
export const CLOSE_FINANCIAL_POSITION_UPDATE_MODAL = 'Financial Positions / Close Financial Position Update Modal';
export const SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL = 'Financial Positions / Submit Financial Position Update Modal';
export const SET_FINANCIAL_POSITION_UPDATE_AMOUNT = 'Financial Positions / Set Financial Position Update Amount';
export const SET_FINANCIAL_POSITION_UPDATE_ACTION = 'Financial Positions / Set Financial Position Update Action';

export const TOGGLE_CURRENCY_ACTIVE = 'Financial Positions / Toggle Currency Active';

export const SHOW_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL =
  'Financial Positions / Show Financial Position Update Confirm Modal';
export const CLOSE_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL =
  'Financial Positions / Close Financial Position Update Confirm Modal';
export const SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL =
  'Financial Positions / Submit Financial Position Update Confirm Modal';
export const UPDATE_FINANCIAL_POSITION_NDC_AFTER_CONFIRM_MODAL =
  'Financial Positions / Update Financial Position NDC After Confirm Modal';

const composeOptions = (opts: any) => {
  return Object.keys(opts).map((k) => ({
    label: k,
    value: opts[k],
  }));
};

export interface Limit {
  currency: Currency;
  limit: { value: number };
}

export interface Account {
  updateInProgress: boolean;
  changedDate: string;
  currency: Currency;
  id: number;
  isActive: boolean;
  ledgerAccountType: 'POSITION' | 'SETTLEMENT';
  value: number;
}

export interface FinancialPosition {
  dfsp: DFSP;
  currency: Currency;
  settlementAccount: Account;
  positionAccount: Account;
  // Optional because when the position account is set inactive the limit is not returned.
  // TODO: raise an issue about this; it doesn't seem sensible
  ndc?: number;
}

export enum FinancialPositionsUpdateAction {
  AddFunds = 'ADD_FUNDS',
  WithdrawFunds = 'WITHDRAW_FUNDS',
  AddWithdrawFunds = 'ADD_WITHDRAW_FUNDS',
  ChangeNetDebitCap = 'CHANGE_NET_DEBIT_CAP',
}

export const updateOptions = composeOptions({
  'Add / Withdraw Funds': FinancialPositionsUpdateAction.AddWithdrawFunds,
  'Change Net Debit Cap': FinancialPositionsUpdateAction.ChangeNetDebitCap,
});

export const fundsOptions = composeOptions({
  'Add Funds': FinancialPositionsUpdateAction.AddFunds,
  'Withdraw Funds': FinancialPositionsUpdateAction.WithdrawFunds,
});

export interface FinancialPositionsState {
  financialPositions: FinancialPosition[];
  financialPositionsError: ErrorMessage;
  isFinancialPositionsPending: boolean;

  selectFinancialPosition?: undefined;
  selectedFinancialPosition?: FinancialPosition;
  selectedFinancialPositionUpdateAction?: FinancialPositionsUpdateAction;
  financialPositionUpdateAmount?: string;
  isFinancialPositionUpdateCancelEnabled?: boolean;
  isFinancialPositionUpdateSubmitPending?: boolean;
  isShowUpdateFinancialPositionConfirmModal: boolean;
  isUpdateFinancialPositionNDCAfterConfirmModal: boolean;
}
