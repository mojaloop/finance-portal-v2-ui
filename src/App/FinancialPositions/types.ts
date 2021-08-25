import { ErrorMessage } from 'App/types';
import { DFSP } from 'App/DFSPs/types';
// import { composeOptions } from '@modusbox/modusbox-ui-components/dist/utils/html';

export const REQUEST_FINANCIAL_POSITIONS = 'Financial Positions / Request Financial Positions';
export const SET_FINANCIAL_POSITIONS = 'Financial Positions / Set Financial Positions';
export const SET_FINANCIAL_POSITIONS_ERROR = 'Financial Positions / Set Financial Positions Error';

export const SELECT_FINANCIAL_POSITION = 'Financial Positions / Select Financial Position';
export const CLOSE_FINANCIAL_POSITION_UPDATE_MODAL = 'Financial Positions / Close Financial Position Update Modal';
export const SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL = 'Financial Positions / Submit Financial Position Update Modal';
export const SET_FINANCIAL_POSITION_UPDATE_AMOUNT = 'Financial Positions / Set Financial Position Update Amount';
export const SET_FINANCIAL_POSITION_UPDATE_ACTION = 'Financial Positions / Set Financial Position Update Action';

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

export interface FinancialPosition {
  dfsp: DFSP;
  balance: number;
  limits: number;
  positions: number;
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
