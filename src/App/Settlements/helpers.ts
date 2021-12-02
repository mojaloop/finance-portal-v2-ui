import { strict as assert } from 'assert';
import moment from 'moment';
import ExcelJS from 'exceljs';
import {
  AccountId,
  AccountWithPosition,
  CurrencyData,
  DateRanges,
  FspName,
  LedgerAccount,
  LedgerAccountType,
  LedgerParticipant,
  Limit,
  Settlement,
  SettlementFilters,
  SettlementParticipant,
  SettlementParticipantAccount,
  SettlementReport,
  SettlementReportValidation,
  SettlementReportValidationKind,
  SettlementReportEntry,
  SettlementStatus,
} from './types';

import { Currency } from '../types';

export const CURRENCY_DATA = new Map<Currency, CurrencyData>([
  ['AED', { alpha: 'AED', numeric: 784, minorUnit: 2 }],
  ['AFN', { alpha: 'AFN', numeric: 971, minorUnit: 2 }],
  ['ALL', { alpha: 'ALL', numeric: 8, minorUnit: 2 }],
  ['AMD', { alpha: 'AMD', numeric: 51, minorUnit: 2 }],
  ['ANG', { alpha: 'ANG', numeric: 532, minorUnit: 2 }],
  ['AOA', { alpha: 'AOA', numeric: 973, minorUnit: 2 }],
  ['ARS', { alpha: 'ARS', numeric: 32, minorUnit: 2 }],
  ['AUD', { alpha: 'AUD', numeric: 36, minorUnit: 2 }],
  ['AWG', { alpha: 'AWG', numeric: 533, minorUnit: 2 }],
  ['AZN', { alpha: 'AZN', numeric: 944, minorUnit: 2 }],
  ['BAM', { alpha: 'BAM', numeric: 977, minorUnit: 2 }],
  ['BBD', { alpha: 'BBD', numeric: 52, minorUnit: 2 }],
  ['BDT', { alpha: 'BDT', numeric: 50, minorUnit: 2 }],
  ['BGN', { alpha: 'BGN', numeric: 975, minorUnit: 2 }],
  ['BHD', { alpha: 'BHD', numeric: 48, minorUnit: 3 }],
  ['BIF', { alpha: 'BIF', numeric: 108, minorUnit: 0 }],
  ['BMD', { alpha: 'BMD', numeric: 60, minorUnit: 2 }],
  ['BND', { alpha: 'BND', numeric: 96, minorUnit: 2 }],
  ['BOB', { alpha: 'BOB', numeric: 68, minorUnit: 2 }],
  ['BOV', { alpha: 'BOV', numeric: 984, minorUnit: 2 }],
  ['BRL', { alpha: 'BRL', numeric: 986, minorUnit: 2 }],
  ['BSD', { alpha: 'BSD', numeric: 44, minorUnit: 2 }],
  ['BTN', { alpha: 'BTN', numeric: 64, minorUnit: 2 }],
  ['BWP', { alpha: 'BWP', numeric: 72, minorUnit: 2 }],
  ['BYN', { alpha: 'BYN', numeric: 933, minorUnit: 2 }],
  ['BZD', { alpha: 'BZD', numeric: 84, minorUnit: 2 }],
  ['CAD', { alpha: 'CAD', numeric: 124, minorUnit: 2 }],
  ['CDF', { alpha: 'CDF', numeric: 976, minorUnit: 2 }],
  ['CHE', { alpha: 'CHE', numeric: 947, minorUnit: 2 }],
  ['CHF', { alpha: 'CHF', numeric: 756, minorUnit: 2 }],
  ['CHW', { alpha: 'CHW', numeric: 948, minorUnit: 2 }],
  ['CLF', { alpha: 'CLF', numeric: 990, minorUnit: 4 }],
  ['CLP', { alpha: 'CLP', numeric: 152, minorUnit: 0 }],
  ['CNY', { alpha: 'CNY', numeric: 156, minorUnit: 2 }],
  ['COP', { alpha: 'COP', numeric: 170, minorUnit: 2 }],
  ['COU', { alpha: 'COU', numeric: 970, minorUnit: 2 }],
  ['CRC', { alpha: 'CRC', numeric: 188, minorUnit: 2 }],
  ['CUC', { alpha: 'CUC', numeric: 931, minorUnit: 2 }],
  ['CUP', { alpha: 'CUP', numeric: 192, minorUnit: 2 }],
  ['CVE', { alpha: 'CVE', numeric: 132, minorUnit: 2 }],
  ['CZK', { alpha: 'CZK', numeric: 203, minorUnit: 2 }],
  ['DJF', { alpha: 'DJF', numeric: 262, minorUnit: 0 }],
  ['DKK', { alpha: 'DKK', numeric: 208, minorUnit: 2 }],
  ['DOP', { alpha: 'DOP', numeric: 214, minorUnit: 2 }],
  ['DZD', { alpha: 'DZD', numeric: 12, minorUnit: 2 }],
  ['EGP', { alpha: 'EGP', numeric: 818, minorUnit: 2 }],
  ['ERN', { alpha: 'ERN', numeric: 232, minorUnit: 2 }],
  ['ETB', { alpha: 'ETB', numeric: 230, minorUnit: 2 }],
  ['EUR', { alpha: 'EUR', numeric: 978, minorUnit: 2 }],
  ['FJD', { alpha: 'FJD', numeric: 242, minorUnit: 2 }],
  ['FKP', { alpha: 'FKP', numeric: 238, minorUnit: 2 }],
  ['GBP', { alpha: 'GBP', numeric: 826, minorUnit: 2 }],
  ['GEL', { alpha: 'GEL', numeric: 981, minorUnit: 2 }],
  ['GHS', { alpha: 'GHS', numeric: 936, minorUnit: 2 }],
  ['GIP', { alpha: 'GIP', numeric: 292, minorUnit: 2 }],
  ['GMD', { alpha: 'GMD', numeric: 270, minorUnit: 2 }],
  ['GNF', { alpha: 'GNF', numeric: 324, minorUnit: 0 }],
  ['GTQ', { alpha: 'GTQ', numeric: 320, minorUnit: 2 }],
  ['GYD', { alpha: 'GYD', numeric: 328, minorUnit: 2 }],
  ['HKD', { alpha: 'HKD', numeric: 344, minorUnit: 2 }],
  ['HNL', { alpha: 'HNL', numeric: 340, minorUnit: 2 }],
  ['HRK', { alpha: 'HRK', numeric: 191, minorUnit: 2 }],
  ['HTG', { alpha: 'HTG', numeric: 332, minorUnit: 2 }],
  ['HUF', { alpha: 'HUF', numeric: 348, minorUnit: 2 }],
  ['IDR', { alpha: 'IDR', numeric: 360, minorUnit: 2 }],
  ['ILS', { alpha: 'ILS', numeric: 376, minorUnit: 2 }],
  ['INR', { alpha: 'INR', numeric: 356, minorUnit: 2 }],
  ['IQD', { alpha: 'IQD', numeric: 368, minorUnit: 3 }],
  ['IRR', { alpha: 'IRR', numeric: 364, minorUnit: 2 }],
  ['ISK', { alpha: 'ISK', numeric: 352, minorUnit: 0 }],
  ['JMD', { alpha: 'JMD', numeric: 388, minorUnit: 2 }],
  ['JOD', { alpha: 'JOD', numeric: 400, minorUnit: 3 }],
  ['JPY', { alpha: 'JPY', numeric: 392, minorUnit: 0 }],
  ['KES', { alpha: 'KES', numeric: 404, minorUnit: 2 }],
  ['KGS', { alpha: 'KGS', numeric: 417, minorUnit: 2 }],
  ['KHR', { alpha: 'KHR', numeric: 116, minorUnit: 2 }],
  ['KMF', { alpha: 'KMF', numeric: 174, minorUnit: 0 }],
  ['KPW', { alpha: 'KPW', numeric: 408, minorUnit: 2 }],
  ['KRW', { alpha: 'KRW', numeric: 410, minorUnit: 0 }],
  ['KWD', { alpha: 'KWD', numeric: 414, minorUnit: 3 }],
  ['KYD', { alpha: 'KYD', numeric: 136, minorUnit: 2 }],
  ['KZT', { alpha: 'KZT', numeric: 398, minorUnit: 2 }],
  ['LAK', { alpha: 'LAK', numeric: 418, minorUnit: 2 }],
  ['LBP', { alpha: 'LBP', numeric: 422, minorUnit: 2 }],
  ['LKR', { alpha: 'LKR', numeric: 144, minorUnit: 2 }],
  ['LRD', { alpha: 'LRD', numeric: 430, minorUnit: 2 }],
  ['LSL', { alpha: 'LSL', numeric: 426, minorUnit: 2 }],
  ['LYD', { alpha: 'LYD', numeric: 434, minorUnit: 3 }],
  ['MAD', { alpha: 'MAD', numeric: 504, minorUnit: 2 }],
  ['MDL', { alpha: 'MDL', numeric: 498, minorUnit: 2 }],
  ['MGA', { alpha: 'MGA', numeric: 969, minorUnit: 2 }],
  ['MKD', { alpha: 'MKD', numeric: 807, minorUnit: 2 }],
  ['MMK', { alpha: 'MMK', numeric: 104, minorUnit: 2 }],
  ['MNT', { alpha: 'MNT', numeric: 496, minorUnit: 2 }],
  ['MOP', { alpha: 'MOP', numeric: 446, minorUnit: 2 }],
  ['MRU', { alpha: 'MRU', numeric: 929, minorUnit: 2 }],
  ['MUR', { alpha: 'MUR', numeric: 480, minorUnit: 2 }],
  ['MVR', { alpha: 'MVR', numeric: 462, minorUnit: 2 }],
  ['MWK', { alpha: 'MWK', numeric: 454, minorUnit: 2 }],
  ['MXN', { alpha: 'MXN', numeric: 484, minorUnit: 2 }],
  ['MXV', { alpha: 'MXV', numeric: 979, minorUnit: 2 }],
  ['MYR', { alpha: 'MYR', numeric: 458, minorUnit: 2 }],
  ['MZN', { alpha: 'MZN', numeric: 943, minorUnit: 2 }],
  ['NAD', { alpha: 'NAD', numeric: 516, minorUnit: 2 }],
  ['NGN', { alpha: 'NGN', numeric: 566, minorUnit: 2 }],
  ['NIO', { alpha: 'NIO', numeric: 558, minorUnit: 2 }],
  ['NOK', { alpha: 'NOK', numeric: 578, minorUnit: 2 }],
  ['NPR', { alpha: 'NPR', numeric: 524, minorUnit: 2 }],
  ['NZD', { alpha: 'NZD', numeric: 554, minorUnit: 2 }],
  ['OMR', { alpha: 'OMR', numeric: 512, minorUnit: 3 }],
  ['PAB', { alpha: 'PAB', numeric: 590, minorUnit: 2 }],
  ['PEN', { alpha: 'PEN', numeric: 604, minorUnit: 2 }],
  ['PGK', { alpha: 'PGK', numeric: 598, minorUnit: 2 }],
  ['PHP', { alpha: 'PHP', numeric: 608, minorUnit: 2 }],
  ['PKR', { alpha: 'PKR', numeric: 586, minorUnit: 2 }],
  ['PLN', { alpha: 'PLN', numeric: 985, minorUnit: 2 }],
  ['PYG', { alpha: 'PYG', numeric: 600, minorUnit: 0 }],
  ['QAR', { alpha: 'QAR', numeric: 634, minorUnit: 2 }],
  ['RON', { alpha: 'RON', numeric: 946, minorUnit: 2 }],
  ['RSD', { alpha: 'RSD', numeric: 941, minorUnit: 2 }],
  ['RUB', { alpha: 'RUB', numeric: 643, minorUnit: 2 }],
  ['RWF', { alpha: 'RWF', numeric: 646, minorUnit: 0 }],
  ['SAR', { alpha: 'SAR', numeric: 682, minorUnit: 2 }],
  ['SBD', { alpha: 'SBD', numeric: 90, minorUnit: 2 }],
  ['SCR', { alpha: 'SCR', numeric: 690, minorUnit: 2 }],
  ['SDG', { alpha: 'SDG', numeric: 938, minorUnit: 2 }],
  ['SEK', { alpha: 'SEK', numeric: 752, minorUnit: 2 }],
  ['SGD', { alpha: 'SGD', numeric: 702, minorUnit: 2 }],
  ['SHP', { alpha: 'SHP', numeric: 654, minorUnit: 2 }],
  ['SLL', { alpha: 'SLL', numeric: 694, minorUnit: 2 }],
  ['SOS', { alpha: 'SOS', numeric: 706, minorUnit: 2 }],
  ['SRD', { alpha: 'SRD', numeric: 968, minorUnit: 2 }],
  ['SSP', { alpha: 'SSP', numeric: 728, minorUnit: 2 }],
  ['STN', { alpha: 'STN', numeric: 930, minorUnit: 2 }],
  ['SVC', { alpha: 'SVC', numeric: 222, minorUnit: 2 }],
  ['SYP', { alpha: 'SYP', numeric: 760, minorUnit: 2 }],
  ['SZL', { alpha: 'SZL', numeric: 748, minorUnit: 2 }],
  ['THB', { alpha: 'THB', numeric: 764, minorUnit: 2 }],
  ['TJS', { alpha: 'TJS', numeric: 972, minorUnit: 2 }],
  ['TMT', { alpha: 'TMT', numeric: 934, minorUnit: 2 }],
  ['TND', { alpha: 'TND', numeric: 788, minorUnit: 3 }],
  ['TOP', { alpha: 'TOP', numeric: 776, minorUnit: 2 }],
  ['TRY', { alpha: 'TRY', numeric: 949, minorUnit: 2 }],
  ['TTD', { alpha: 'TTD', numeric: 780, minorUnit: 2 }],
  ['TWD', { alpha: 'TWD', numeric: 901, minorUnit: 2 }],
  ['TZS', { alpha: 'TZS', numeric: 834, minorUnit: 2 }],
  ['UAH', { alpha: 'UAH', numeric: 980, minorUnit: 2 }],
  ['UGX', { alpha: 'UGX', numeric: 800, minorUnit: 0 }],
  ['USD', { alpha: 'USD', numeric: 840, minorUnit: 2 }],
  ['USN', { alpha: 'USN', numeric: 997, minorUnit: 2 }],
  ['UYI', { alpha: 'UYI', numeric: 940, minorUnit: 0 }],
  ['UYU', { alpha: 'UYU', numeric: 858, minorUnit: 2 }],
  ['UYW', { alpha: 'UYW', numeric: 927, minorUnit: 4 }],
  ['UZS', { alpha: 'UZS', numeric: 860, minorUnit: 2 }],
  ['VED', { alpha: 'VED', numeric: 926, minorUnit: 2 }],
  ['VES', { alpha: 'VES', numeric: 928, minorUnit: 2 }],
  ['VND', { alpha: 'VND', numeric: 704, minorUnit: 0 }],
  ['VUV', { alpha: 'VUV', numeric: 548, minorUnit: 0 }],
  ['WST', { alpha: 'WST', numeric: 882, minorUnit: 2 }],
  ['XAF', { alpha: 'XAF', numeric: 950, minorUnit: 0 }],
  ['XAG', { alpha: 'XAG', numeric: 961, minorUnit: '.' }],
  ['XAU', { alpha: 'XAU', numeric: 959, minorUnit: '.' }],
  ['XBA', { alpha: 'XBA', numeric: 955, minorUnit: '.' }],
  ['XBB', { alpha: 'XBB', numeric: 956, minorUnit: '.' }],
  ['XBC', { alpha: 'XBC', numeric: 957, minorUnit: '.' }],
  ['XBD', { alpha: 'XBD', numeric: 958, minorUnit: '.' }],
  ['XCD', { alpha: 'XCD', numeric: 951, minorUnit: 2 }],
  ['XDR', { alpha: 'XDR', numeric: 960, minorUnit: '.' }],
  ['XOF', { alpha: 'XOF', numeric: 952, minorUnit: 0 }],
  ['XPD', { alpha: 'XPD', numeric: 964, minorUnit: '.' }],
  ['XPF', { alpha: 'XPF', numeric: 953, minorUnit: 0 }],
  ['XPT', { alpha: 'XPT', numeric: 962, minorUnit: '.' }],
  ['XSU', { alpha: 'XSU', numeric: 994, minorUnit: '.' }],
  ['XTS', { alpha: 'XTS', numeric: 963, minorUnit: '.' }],
  ['XUA', { alpha: 'XUA', numeric: 965, minorUnit: '.' }],
  ['XXX', { alpha: 'XXX', numeric: 999, minorUnit: '.' }],
  ['YER', { alpha: 'YER', numeric: 886, minorUnit: 2 }],
  ['ZAR', { alpha: 'ZAR', numeric: 710, minorUnit: 2 }],
  ['ZMW', { alpha: 'ZMW', numeric: 967, minorUnit: 2 }],
  ['ZWL', { alpha: 'ZWL', numeric: 932, minorUnit: 2 }],
]);

// TODO: should really be the following type. One of the most dire problems with the usage of TS in
// this whole repo: the surface of the application should be typed, i.e. the ML API should have
// types, and all responses should be validated as having those types, perhaps by ajv, if there's
// some sort of ajv/typescript integration.
// type ApiResponse<T> =
//   | { kind: 'ERROR', status: number, data: MojaloopError }
//   | { kind: 'SUCCESS', status: number, data: T }
export interface ApiResponse {
  status: number;
  data: any;
}

export const finalizeDataUtils = {
  getParticipantsAccounts: function getParticipantsAccounts(
    participants: LedgerParticipant[],
  ): SettlementFinalizeData['participantsAccounts'] {
    return participants
      .filter((fsp) => !/hub/i.test(fsp.name))
      .reduce(
        (result, fsp) =>
          fsp.accounts.reduce((map, acc) => {
            const leaf = { participant: fsp, account: acc };
            const fspNode = map.get(fsp.name);
            if (fspNode) {
              const currencyNode = fspNode.get(acc.currency);
              if (currencyNode) {
                currencyNode.set(acc.ledgerAccountType, leaf);
                return map;
              }
              fspNode.set(acc.currency, new Map([[acc.ledgerAccountType, leaf]]));
              return map;
            }
            return map.set(fsp.name, new Map([[acc.currency, new Map([[acc.ledgerAccountType, leaf]])]]));
          }, result),
        new Map<FspName, Map<Currency, Map<LedgerAccountType, AccountParticipant>>>(),
      );
  },

  ensureResponse: function ensureResponse(response: ApiResponse, status: number, msg: string) {
    assert.equal(response.status, status, msg);
    return response.data;
  },

  transformParticipantsLimits: function transformParticipantsLimits(
    limits: { name: FspName; currency: Currency; limit: Limit }[],
  ): SettlementFinalizeData['participantsLimits'] {
    return limits.reduce((result, e) => {
      if (result.get(e.name)?.set(e.currency, e.limit) === undefined) {
        result.set(e.name, new Map([[e.currency, e.limit]]));
      }
      return result;
    }, new Map<FspName, Map<Currency, Limit>>());
  },

  getAccountsParticipants: function getAccountsParticipants(
    participants: LedgerParticipant[],
  ): SettlementFinalizeData['accountsParticipants'] {
    return participants
      .filter((fsp) => !/hub/i.test(fsp.name))
      .reduce(
        (result, fsp) => fsp.accounts.reduce((map, acc) => map.set(acc.id, { participant: fsp, account: acc }), result),
        new Map<AccountId, AccountParticipant>(),
      );
  },

  getSettlementParticipantAccounts: function getSettlementParticipantAccounts(
    settlementParticipants: SettlementParticipant[],
  ): SettlementFinalizeData['settlementParticipantAccounts'] {
    return settlementParticipants.reduce(
      (mapP, p) => p.accounts.reduce((mapA, acc) => mapA.set(acc.id, acc), mapP),
      new Map<AccountId, SettlementParticipantAccount>(),
    );
  },

  getSettlementParticipants: function getSettlementParticipants(
    settlementParticipants: SettlementParticipant[],
  ): SettlementFinalizeData['settlementParticipants'] {
    return settlementParticipants.reduce(
      (mapP, p) => p.accounts.reduce((mapA, acc) => mapA.set(acc.id, p), mapP),
      new Map<AccountId, SettlementParticipant>(),
    );
  },

  getAccountsPositions: function getAccountsPositions(
    data: AccountWithPosition[],
  ): SettlementFinalizeData['accountsPositions'] {
    return data.reduce(
      (map: Map<AccountId, AccountWithPosition>, acc: AccountWithPosition) => map.set(acc.id, acc),
      new Map<AccountId, AccountWithPosition>(),
    );
  },
};

export interface AccountParticipant {
  participant: LedgerParticipant;
  account: LedgerAccount;
}
export type AccountsParticipants = Map<AccountId, AccountParticipant>;
export type ParticipantsAccounts = Map<FspName, Map<Currency, Map<LedgerAccountType, AccountParticipant>>>;

export interface SettlementFinalizeData {
  participantsLimits: Map<FspName, Map<Currency, Limit>>;
  accountsParticipants: AccountsParticipants;
  participantsAccounts: ParticipantsAccounts;
  accountsPositions: Map<AccountId, AccountWithPosition>;
  settlementParticipantAccounts: Map<AccountId, SettlementParticipantAccount>;
  settlementParticipants: Map<AccountId, SettlementParticipant>;
}

export { buildUpdateSettlementStateRequest } from '../helpers';

const isNumericTextRe =
  /^(\((?<parenthesized>(([0-9]{1,3}(,[0-9]{3})*)|([0-9]+))(\.[0-9]+)?)\)|(?<positive>(([0-9]{1,3}(,[0-9]{3})*)|([0-9]+))(\.[0-9]+)?)|(?<negative>-(([0-9]{1,3}(,[0-9]{3})*)|([0-9]+))(\.[0-9]+)?))$/g;
export const extractReportQuantity = (text: string): number => {
  const allMatches = Array.from(text.matchAll(isNumericTextRe));
  if (allMatches.length !== 1 || allMatches[0].length === 0) {
    return NaN;
  }
  let { parenthesized } = allMatches[0]?.groups || {};
  const { positive, negative } = allMatches[0]?.groups || {};
  if (parenthesized) {
    parenthesized = `-${parenthesized}`;
  }
  return Number((positive || negative || parenthesized)?.replace(/,/g, ''));
};

const getDateRangesTimestamps = {
  Any: () => ({
    start: undefined,
    end: undefined,
  }),
  [DateRanges.Today]: () => ({
    start: parseInt(moment().startOf('day').format('x'), 10),
    end: parseInt(moment().endOf('day').format('x'), 10),
  }),
  [DateRanges.TwoDays]: () => ({
    start: parseInt(moment().subtract(48, 'hours').format('x'), 10),
    end: parseInt(moment().endOf('day').format('x'), 10),
  }),
  [DateRanges.OneWeek]: () => ({
    start: parseInt(moment().subtract(168, 'hours').format('x'), 10),
    end: parseInt(moment().endOf('day').format('x'), 10),
  }),
  [DateRanges.OneMonth]: () => ({
    start: parseInt(moment().subtract(720, 'hours').format('x'), 10),
    end: parseInt(moment().endOf('day').format('x'), 10),
  }),
  [DateRanges.Custom]: () => ({
    start: undefined,
    end: undefined,
  }),
};

export function getDateRangeTimestamp(range: DateRanges, selector: 'start' | 'end'): number | undefined {
  const dateRangeBuilder = getDateRangesTimestamps[range];
  const rangeTimestamps = dateRangeBuilder();
  // @ts-ignore
  return rangeTimestamps[selector];
}

export function formatDate(timestamp: string | undefined): string | undefined {
  if (!timestamp) {
    return undefined;
  }
  return moment(timestamp).format('DD/MM/YYYY LT z');
}

export function formatNumber(number: number | string) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

interface SettlementStatusProperties {
  color: string;
  label: string;
}
export function getStatusProperties(state: SettlementStatus): SettlementStatusProperties {
  const statusLabels: Record<SettlementStatus, SettlementStatusProperties> = {
    [SettlementStatus.PendingSettlement]: { color: 'blue', label: 'Pending Settlement' },
    [SettlementStatus.PsTransfersRecorded]: { color: 'purple', label: 'PS Transfers Recorded' },
    [SettlementStatus.PsTransfersReserved]: { color: 'pink', label: 'PS Transfers Reserved' },
    [SettlementStatus.PsTransfersCommitted]: { color: 'yellow', label: 'PS Transfers Committed' },
    [SettlementStatus.Settling]: { color: 'orange', label: 'Settling' },
    [SettlementStatus.Settled]: { color: 'green', label: 'Settled' },
    [SettlementStatus.Aborted]: { color: 'red', label: 'Aborted' },
  };
  return statusLabels[state];
}

export function zeroToDash(value: string | number): string | number {
  if (value === '0' || value === 0) {
    return '-';
  }
  return value;
}

export function buildFiltersParams(filters: SettlementFilters) {
  return {
    state: filters.state,
    // The default datetimes are the earliest and latest dates representable in the MySQL DATETIME
    // type. The database *shouldn't* leak here, really, but these aren't insane "default" dates to
    // have, in any case.
    fromDateTime: filters.start ? moment(filters.start).toISOString() : '1000-01-01T00:00:00Z',
    toDateTime: filters.end ? moment(filters.end).toISOString() : '9999-12-31T23:59:59Z',
  };
}

/* @ts-ignore */
export function mapApiToModel(item: any): Settlement {
  return {
    id: item.id,
    state: item.state,
    participants: item.participants,
    settlementWindows: item.settlementWindows,
    reason: item.reason,
    createdDate: item.createdDate,
    changedDate: item.changedDate,

    totalValue: item.participants.reduce((p: number, c: any) => {
      /* @ts-ignore */
      return p + c.accounts.reduce((pp: number, cc: any) => pp + Math.max(cc.netSettlementAmount.amount, 0), 0);
    }, 0),
  };
}

export function generateSettlementReportValidationDetail(val: SettlementReportValidation) {
  switch (val.kind) {
    case SettlementReportValidationKind.SettlementIdNonMatching:
      return (
        `The settlement ID in the report is: ${val.data.reportId}. The settlement ID selected ` +
        `was: ${val.data.settlementId}.`
      );
    case SettlementReportValidationKind.TransfersSumNonZero:
      return null;
    case SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount:
      return (
        `Row ${val.data.entry.row.rowNumber} of the report is for account ID ` +
        `${val.data.entry.positionAccountId}. In the settlement, this account has a net ` +
        `settlement amount of ${val.data.account.netSettlementAmount}.`
      );
    case SettlementReportValidationKind.BalanceNotAsExpected:
      return (
        `Row ${val.data.entry.row.rowNumber} of the report has a balance of ` +
        `${val.data.reportBalance} and a transfer amount of ${val.data.transferAmount}. ` +
        `${val.data.entry.participant.name} presently has a liquidity account balance of ` +
        `${val.data.account.value}. Applying the transfer to this balance results in an ` +
        `expected balance of ${val.data.expectedBalance}. The balance in the report is ` +
        `${val.data.reportBalance}.`
      );
    case SettlementReportValidationKind.AccountsNotPresentInReport: {
      // prettier-ignore
      const printAccount = (
        { participant, account }: { participant?: FspName; account: SettlementParticipantAccount }
      ) => `${account.id}` + (participant ? ` (${participant})` : ''); // eslint-disable-line prefer-template
      return (
        `Reports present in the settlement, but not present in the report are: ` + // eslint-disable-line prefer-template
        val.data.map(printAccount).join(',') +
        '.'
      );
    }
    case SettlementReportValidationKind.ExtraAccountsPresentInReport:
      return (
        `The account on row ${val.data.entry.row.rowNumber}, account ID: ` +
        `${val.data.entry.positionAccountId} is not present in the settlement.`
      );
    case SettlementReportValidationKind.ReportIdentifiersNonMatching:
      return `The switch identifiers in row ${val.data.entry.row.rowNumber} did not match each other.`;
    case SettlementReportValidationKind.AccountIsIncorrectType:
      return (
        `The account ID in row ${val.data.entry.row.rowNumber} of the report should be a ` +
        `position account, but is instead a ${val.data.switchAccount.ledgerAccountType} type.`
      );
    case SettlementReportValidationKind.NewBalanceAmountInvalid:
      return (
        `Row ${val.data.entry.row.rowNumber} of the report contains a balance of ` +
        `${val.data.entry.row.balance} and an account ID of ` +
        `${val.data.entry.positionAccountId} with a currency of ` +
        `${val.data.currencyData.alpha}. This balance is not a valid amount in this currency.`
      );
    case SettlementReportValidationKind.TransferAmountInvalid:
      return (
        `Row ${val.data.entry.row.rowNumber} of the report contains a transfer amount of ` +
        `${val.data.entry.row.transferAmount} and an account ID of ` +
        `${val.data.entry.positionAccountId} with a currency of ` +
        `${val.data.currencyData.alpha}. This transfer amount is not a valid amount in this ` +
        'currency.'
      );
    case SettlementReportValidationKind.InvalidAccountId:
      return (
        `Row ${val.data.entry.row.rowNumber} contains account ID ` +
        `${val.data.entry.positionAccountId}, which does not exist in the switch.`
      );
    default: {
      // Did you get a compile error here? This code is written such that if every
      // case in the above switch state is not handled, compilation will fail.
      const exhaustiveCheck: never = val;
      throw new Error(`Unhandled validation: ${exhaustiveCheck}`);
    }
  }
}

export function explainSettlementReportValidationKind(kind: SettlementReportValidationKind) {
  switch (kind) {
    case SettlementReportValidationKind.SettlementIdNonMatching:
      return (
        'The settlement ID for the settlement selected to finalize is compared against the settlement ID in the ' +
        'settlement finalization report. These must be the same.'
      );
    case SettlementReportValidationKind.TransfersSumNonZero:
      return (
        'Transfers in the settlement finalization report are added together. The sum should be zero. Sometimes ' +
        'it is not, because the settlement bank may not have processed every line in the report, or may have ' +
        'processed the report differently than it was produced.'
      );
    case SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount:
      return (
        "The transfer amount supplied in the settlement finalization report doesn't match the settlement amount " +
        'in the settlement.'
      );
    case SettlementReportValidationKind.BalanceNotAsExpected:
      return (
        'The transfer amount in the settlement finalization report is added to or subtracted from (as ' +
        'appropriate) the current liquidity account balance value in the switch. The result is expected to be equal ' +
        'to the new liquidity account balance in the settlement finalization report. These may not be equal if ' +
        'funds have been added to or removed from the switch liquidity account balance since settlement initiation.'
      );
    case SettlementReportValidationKind.AccountsNotPresentInReport:
      return 'The settlement finalization report does not contain all report present in the settlement.';
    case SettlementReportValidationKind.ExtraAccountsPresentInReport:
      return 'The settlement finalization report contains accounts not present in the settlement.';
    case SettlementReportValidationKind.ReportIdentifiersNonMatching:
      return (
        'The participant ID, account ID and participant name provided in the switch identifiers column of the ' +
        'settlement finalization report did not match each other. When the account ID was looked up, it did not ' +
        'match the ID of the settlement participant, or the name of the participant.'
      );
    case SettlementReportValidationKind.AccountIsIncorrectType:
      return (
        'The settlement finalization report contains an account that is not of the correct account type. This could ' +
        'be caused by an error in the generation of the initialization report, or the finalization report may have ' +
        'been manually generated, or modified.'
      );
    case SettlementReportValidationKind.NewBalanceAmountInvalid:
      return (
        'A balance amount in the settlement finalization report is not a valid amount in the currency of the ' +
        'liquidity account specified in the report.'
      );
    case SettlementReportValidationKind.TransferAmountInvalid:
      return (
        'A transfer amount in the settlement finalization report is not a valid amount in the currency of the ' +
        'liquidity account specified in the report.'
      );
    case SettlementReportValidationKind.InvalidAccountId:
      return 'The settlement finalization report contains an account ID that is not a valid ID in the switch.';
    default: {
      // Did you get a compile error here? This code is written such that if every
      // case in the above switch state is not handled, compilation will fail.
      const exhaustiveCheck: never = kind;
      throw new Error(`Unhandled validation: ${exhaustiveCheck}`);
    }
  }
}

// Because no currency has more than four decimal places, we can have quite a large epsilon value
const EPSILON = 1e-5;
const equal = (a: number, b: number) => Math.abs(a - b) < EPSILON;

export const validationFunctions = {
  union: function union<T>(...args: Set<T>[]) {
    return args.reduce((res, a) => [...a.values()].reduce((resA, v) => resA.add(v), res), new Set<T>());
  },

  settlementId: function validateReportSettlementId(report: SettlementReport, settlement: Settlement) {
    const result = new Set<SettlementReportValidation>();
    if (settlement.id !== report.settlementId) {
      result.add({
        kind: SettlementReportValidationKind.SettlementIdNonMatching,
        data: {
          reportId: report.settlementId,
          settlementId: settlement.id,
        },
      });
    }
    return result;
  },

  transfersSum: function validateTransfersSum(report: SettlementReport) {
    const result = new Set<SettlementReportValidation>();
    const reportTransfersSum = report.entries.reduce((sum, e) => sum + e.transferAmount, 0);
    if (!equal(reportTransfersSum, 0)) {
      result.add({ kind: SettlementReportValidationKind.TransfersSumNonZero });
    }
    return result;
  },

  transfersMatchNetSettlements: function matchTransfersToNetSettlements(
    report: SettlementReport,
    settlementParticipantAccounts: SettlementFinalizeData['settlementParticipantAccounts'],
  ) {
    const result = new Set<SettlementReportValidation>();
    report.entries.forEach((entry) => {
      const spa = settlementParticipantAccounts.get(entry.positionAccountId);
      if (spa && entry.transferAmount !== spa.netSettlementAmount.amount) {
        result.add({
          kind: SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount,
          data: {
            entry,
            account: spa,
          },
        });
      }
    });
    return result;
  },

  balancesAsExpected: function checkBalancesAsExpected(report: SettlementReport, data: SettlementFinalizeData) {
    const result = new Set<SettlementReportValidation>();
    report.entries
      .map((entry) => {
        // collect data for this entry
        const { account: positionAccount, participant } = data.accountsParticipants.get(entry.positionAccountId) || {};
        if (!positionAccount || !participant) {
          return undefined;
        }
        const settlementAccountId = data.participantsAccounts
          .get(participant.name)
          ?.get(positionAccount.currency)
          ?.get('SETTLEMENT')?.account.id;
        if (settlementAccountId === undefined) {
          return undefined;
        }
        const settlementAccount = data.accountsPositions.get(settlementAccountId);
        if (settlementAccount === undefined) {
          return undefined;
        }
        return {
          entry,
          settlementAccount,
        };
      })
      .filter((e): e is { entry: SettlementReportEntry; settlementAccount: AccountWithPosition } => e !== undefined)
      .forEach(({ entry, settlementAccount }) => {
        const expectedBalance = settlementAccount.value + entry.transferAmount;
        const reportBalance = entry.balance;
        if (!equal(expectedBalance, reportBalance)) {
          result.add({
            kind: SettlementReportValidationKind.BalanceNotAsExpected,
            data: {
              entry,
              reportBalance,
              expectedBalance,
              transferAmount: entry.transferAmount,
              account: settlementAccount,
            },
          });
        }
      });
    return result;
  },

  settlementAccountsPresentInReport: function checkSettlementAccountsPresentInReport(
    report: SettlementReport,
    settlement: Settlement,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    const reportAccountIds = new Set(report.entries.map((entry) => entry.positionAccountId));
    const accountsNotInReport = settlement.participants.flatMap((p) =>
      p.accounts.filter((acc) => !reportAccountIds.has(acc.id)),
    );
    if (accountsNotInReport.length !== 0) {
      result.add({
        kind: SettlementReportValidationKind.AccountsNotPresentInReport,
        data: accountsNotInReport.map((account) => ({
          participant: accountsParticipants.get(account.id)?.participant.name,
          account,
        })),
      });
    }
    return result;
  },

  accountsValid: function checkAccountsValid(
    report: SettlementReport,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    report.entries
      .filter((entry) => !accountsParticipants.has(entry.positionAccountId))
      .forEach((entry) => {
        result.add({
          kind: SettlementReportValidationKind.InvalidAccountId,
          data: {
            entry,
          },
        });
      });
    return result;
  },

  extraAccountsPresent: function checkExtraAccountsPresent(
    report: SettlementReport,
    settlement: Settlement,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    const settlementAccountIds = new Set(settlement.participants.flatMap((p) => p.accounts.map((acc) => acc.id)));
    report.entries
      .filter((entry) => !settlementAccountIds.has(entry.positionAccountId))
      .forEach((entry) => {
        result.add({
          kind: SettlementReportValidationKind.ExtraAccountsPresentInReport,
          data: {
            entry,
            participant: accountsParticipants.get(entry.positionAccountId)?.participant.name,
          },
        });
      });
    return result;
  },

  reportIdentifiersCongruent: function checkReportIdentifiersCongruent(
    report: SettlementReport,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
    settlementParticipants: SettlementFinalizeData['settlementParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    report.entries.forEach((entry) => {
      const switchParticipant = accountsParticipants.get(entry.positionAccountId);
      const settlementParticipantId = settlementParticipants.get(entry.positionAccountId)?.id;
      // If we can't find the participant using the account ID, we'll have already returned an
      // "Invalid Account" error. If we can't find the settlement participant using the account ID,
      // we'll have returned an "account not in settlement" error.
      if (switchParticipant && settlementParticipantId) {
        if (
          entry.participant.name !== switchParticipant.participant.name ||
          entry.participant.id !== settlementParticipantId
        ) {
          result.add({
            kind: SettlementReportValidationKind.ReportIdentifiersNonMatching,
            data: { entry },
          });
        }
      }
    });
    return result;
  },

  accountType: function validateAccountType(
    report: SettlementReport,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    report.entries.forEach((entry) => {
      const account = accountsParticipants.get(entry.positionAccountId)?.account;
      if (account && account.ledgerAccountType !== 'POSITION') {
        result.add({
          kind: SettlementReportValidationKind.AccountIsIncorrectType,
          data: {
            switchAccount: account,
            entry,
          },
        });
      }
    });
    return result;
  },

  amounts: function validateReportAmounts(
    report: SettlementReport,
    accountsParticipants: SettlementFinalizeData['accountsParticipants'],
  ) {
    const result = new Set<SettlementReportValidation>();
    report.entries.forEach((entry) => {
      const account = accountsParticipants.get(entry.positionAccountId)?.account;
      if (account) {
        const currencyData = CURRENCY_DATA.get(account.currency);
        // TODO: later, we compare the fractional length of the numeric amount against the number of
        // minor units used in the currency. This is a little workaround; what we really need to test
        // is: can this value represent this currency (or vice versa)? The reason this particular
        // code doesn't _quite_ work is because two currencies have base-5 minor units according to
        // Wikipedia.
        // https://en.m.wikipedia.org/wiki/ISO_4217#Minor_units_of_currency
        assert(
          currencyData !== undefined,
          `Runtime error retrieving currency data for account ${entry.positionAccountId} for ${account.currency} for finalization report row ${entry.row.rowNumber}`,
        );
        assert(account.currency !== 'MRU' && account.currency !== 'MGA', `Unsupported currency ${account.currency}`);
        const balanceFrac = entry.balance.toString().split('.')[1];
        const transferFrac = entry.transferAmount.toString().split('.')[1];
        if (balanceFrac) {
          if (currencyData.minorUnit > balanceFrac.length) {
            result.add({
              kind: SettlementReportValidationKind.NewBalanceAmountInvalid,
              data: {
                currencyData,
                entry,
              },
            });
          }
        }
        if (transferFrac) {
          if (currencyData.minorUnit > transferFrac.length) {
            result.add({
              kind: SettlementReportValidationKind.TransferAmountInvalid,
              data: {
                currencyData,
                entry,
              },
            });
          }
        }
      }
    });
    return result;
  },
};

export function validateReport(
  report: SettlementReport,
  data: SettlementFinalizeData,
  settlement: Settlement,
): Set<SettlementReportValidation> {
  // SettlementIdNonMatching = 'selected settlement ID does not match report settlement ID',
  const settlementIdResult = validationFunctions.settlementId(report, settlement);

  // TransfersSumNonZero = 'sum of transfers in the report is non-zero',
  const transferSumResult = validationFunctions.transfersSum(report);

  // TransferDoesNotMatchNetSettlementAmount = 'transfer amount does not match net settlement amount',
  const transfersMatchResult = validationFunctions.transfersMatchNetSettlements(
    report,
    data.settlementParticipantAccounts,
  );

  // BalancesNotAsExpected = 'balances not modified corresponding to transfer amounts',
  const expectedBalanceResult = validationFunctions.balancesAsExpected(report, data);

  // AccountsNotPresent = 'accounts in settlement not present in report',
  const accountsPresentResult = validationFunctions.settlementAccountsPresentInReport(
    report,
    settlement,
    data.accountsParticipants,
  );

  // InvalidAccountId = 'report account ID does not exist in switch',
  const accountsValidResult = validationFunctions.accountsValid(report, data.accountsParticipants);

  // ExtraAccountsPresent = 'accounts in report not present in settlement',
  const extraAccountsResult = validationFunctions.extraAccountsPresent(report, settlement, data.accountsParticipants);

  // ReportIdentifiersNonMatching = 'report identifiers do not match - participant ID, account ID and participant name must match',
  const reportIdentifiersMatchResult = validationFunctions.reportIdentifiersCongruent(
    report,
    data.accountsParticipants,
    data.settlementParticipants,
  );

  // AccountIsIncorrectType = 'account type should be POSITION',
  const accountTypeValidResult = validationFunctions.accountType(report, data.accountsParticipants);

  // NewBalanceAmountInvalid = 'new balance amount not valid for currency',
  // TransferAmountInvalid = 'transfer amount not valid for currency',
  const amountsValidResult = validationFunctions.accountType(report, data.accountsParticipants);

  return validationFunctions.union(
    settlementIdResult,
    transferSumResult,
    transfersMatchResult,
    expectedBalanceResult,
    accountsPresentResult,
    accountsValidResult,
    extraAccountsResult,
    reportIdentifiersMatchResult,
    accountTypeValidResult,
    amountsValidResult,
  );
}

export function readFileAsArrayBuffer(file: File): PromiseLike<ArrayBuffer> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    // TODO: better investigate usage of 'as ArrayBuffer'
    reader.onload = () => res(reader.result as ArrayBuffer);
    reader.onerror = rej;
    reader.readAsArrayBuffer(file);
  });
}

// Note: ExcelJS does not support streaming in browser.
export function deserializeReport(buf: ArrayBuffer): PromiseLike<SettlementReport> {
  const wb = new ExcelJS.Workbook();
  return wb.xlsx.load(buf).then(() => {
    const SETTLEMENT_ID_CELL = 'B1';
    const PARTICIPANT_INFO_COL = 'A';
    const BALANCE_COL = 'C';
    const TRANSFER_AMOUNT_COL = 'D';

    const ws = wb.getWorksheet(1);
    const settlementIdText = ws.getCell(SETTLEMENT_ID_CELL).text;
    const settlementId = Number(settlementIdText);
    assert(
      /^[0-9]+$/.test(settlementIdText) && !Number.isNaN(settlementId),
      new Error(`Unable to extract settlement ID from cell ${SETTLEMENT_ID_CELL}. Found: ${settlementIdText}`),
    );

    const startOfData = 7;
    let endOfData = 7;
    while (ws.getCell(`A${endOfData}`).text !== '') {
      endOfData += 1;
    }

    const entries =
      ws.getRows(startOfData, endOfData - startOfData)?.map((r) => {
        const switchIdentifiers = r.getCell(PARTICIPANT_INFO_COL).text;
        // TODO: check valid FSP name. It *should* be ASCII; because it has to go into an HTTP
        // header verbatim, and HTTP headers are restricted to printable ASCII. However, the ML
        // spec might differently, or further restrict it.
        const re = /^([0-9]+) ([0-9]+) ([a-zA-Z][a-zA-Z0-9]{1,29})$/g;
        assert(
          re.test(switchIdentifiers),
          `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${switchIdentifiers}]. Matching regex: ${re}`,
        );
        const [idText, accountIdText, name] = switchIdentifiers.split(' ');
        const [id, positionAccountId] = [Number(idText), Number(accountIdText)];
        assert(
          !Number.isNaN(id) && !Number.isNaN(positionAccountId) && name,
          `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${switchIdentifiers}]`,
        );

        const balanceText = r.getCell(BALANCE_COL).text;
        const balance = extractReportQuantity(balanceText);
        assert(
          !Number.isNaN(balance),
          `Unable to extract account balance from ${BALANCE_COL}${r.number}. Cell contents: [${balanceText}]`,
        );

        const transferAmountText = r.getCell(TRANSFER_AMOUNT_COL).text;
        const transferAmount = extractReportQuantity(transferAmountText);
        assert(
          !Number.isNaN(transferAmount),
          `Unable to extract transfer amount from ${TRANSFER_AMOUNT_COL}${r.number}. Cell contents: [${transferAmountText}]`,
        );

        return {
          participant: {
            id,
            name,
          },
          positionAccountId,
          balance,
          transferAmount,
          row: {
            rowNumber: r.number,
            switchIdentifiers,
            balance,
            transferAmount,
          },
        };
      }) || [];

    return {
      settlementId,
      entries,
    };
  });
}
