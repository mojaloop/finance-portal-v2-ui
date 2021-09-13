export const REQUEST_TRANSFERS = 'Transfers / Request Transfers';
export const SET_TRANSFERS = 'Transfers / Set Transfers';
export const SET_TRANSFERS_ERROR = 'Transfers / Set Transfers Error';
export const SET_TRANSFERS_FILTER_VALUE = 'Transfers / Set Transfers Filter Value';
export const CLEAR_TRANSFERS_FILTERS = 'Transfers / Clear Transfers Filters';
export const SELECT_TRANSFER = 'Transfers / Select Transfer';
export const SET_TRANSFER_DETAILS = 'Transfers / Set Transfer Details';
export const SET_TRANSFER_DETAILS_ERROR = ' Transfers / Set Transfer Details Error';
export const CLOSE_TRANSFER_DETAIL_MODAL = 'Transfers / Close Transfer Detail Modal';
export const REQUEST_TRANSFERS_ERRORS = 'Transfers / Request Transfers Errors';
export const SET_IS_TRANSFERS_PENDING = 'Transfers / Set Is Transfers Pending';
export const REQUEST_TRANSFER_DETAILS = 'Transfers / Request Transfer Details';
export const SET_SELECTED_TRANSFER = 'Transfers / Set Selected Transfer';
export const TRANSFER_DETAILS_MODAL_CLOSE = 'Transfers / Transfer Details Modal Close';

export interface TransfersFilter {
  transferId: string | undefined;
  payerFspid: string | undefined;
  payeeFspid: string | undefined;
  payerIdType: string | undefined;
  payerIdValue: string | undefined;
  payeeIdType: string | undefined;
  payeeIdValue: string | undefined;
  from: string | undefined;
  to: string | undefined;
}

export type FilterChangeValue = string | number;

export interface Transfer {
  id: string;
  quoteTimestamp: string;
  transferTimestamp: string;
  payerFspid: string;
  payeeFspid: string;
  type: TransferType;
  currency: string;
  amount: string;
  status: TransferStatus;
  payerParty: TransferParty;
  payeeParty: TransferParty;
}

export type TransferType = string;

export type TransferStatus = string;

export interface QuoteRequest {
  quoteId: string;
  [key: string]: any;
}

export interface QuoteResponse {
  quoteResponseId: string | number;
  [key: string]: any;
}

export interface TransferPrepare {
  transferId: string;
  [key: string]: any;
}

export interface TransferDetail {
  transferId: string;
  quoteRequests: QuoteRequest[];
  quoteParties: object[];
  quoteResponses: QuoteResponse[];
  quoteErrors: object[];
  transferPrepares: TransferPrepare[];
  transferFulfilments: object[];
  transferParticipants: object[];
  transferStateChanges: object[];
  unstructuredData: string[] | undefined;
}

export interface ExtensionListItem {
  key: string;
  value: string;
}

export interface TransferParty {
  type: string;
  idType: string;
  idValue: string;
  idSubValue?: string;
  displayName?: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  merchantClassificationCode?: string;
  fspId: string;
  extensionList?: ExtensionListItem[];
}

export interface MojaloopError {
  errorInformation: MojaloopErrorInformation;
}

export interface MojaloopErrorInformation {
  errorCode: string;
  errorDescription: string;
  extensionList?: ExtensionListItem[];
}

export interface TransfersState {
  transfers: Transfer[];
  selectedTransfer: TransferDetail | undefined;
  transfersError: string | null;
  transfersFilter: TransfersFilter;
  isTransfersPending: Boolean;
  isTransferDetailsPending: Boolean;
}
