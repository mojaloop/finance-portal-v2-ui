import { strict as assert } from 'assert';
import moment from 'moment';
import ExcelJS from 'exceljs';
import {
  AccountId,
  AccountWithPosition,
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
  SettlementReportEntry,
  SettlementReportRow,
  SettlementStatus,
} from './types';

import { Currency } from '../types';

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

export { buildUpdateSettlementStateRequest } from 'App/helpers';

const isNumericTextRe =
  /^(\((?<parenthesized>[0-9]+(\.[0-9]+)?)\)|(?<positive>[0-9]+(\.[0-9]+)?)|(?<negative>-[0-9]+(\.[0-9]+)?))$/g;
// TODO: unit testing
// TODO: Note: commas: https://modusbox.atlassian.net/browse/MMD-1827
const extractReportQuantity = (text: string): number => {
  const allMatches = Array.from(text.matchAll(isNumericTextRe));
  if (allMatches.length !== 1 || allMatches[0].length === 0) {
    return NaN;
  }
  const { positive, negative, parenthesized } = allMatches[0]?.groups || {};
  return Number(positive || negative || parenthesized);
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

// function validateSettlementReportAgainstSettlement(settlement: Settlement, report: SettlementReport) {
//     assert.equal(
//       settlement.id,
//       report.settlementId,
//       `Selected settlement ID is ${settlement.id}. File uploaded is for settlement ${report.settlementId}`,
//     );
// // Check:
// // Warn (because a participant can withdraw funds from these accounts, so some things might line
// // up funny):
// // - all transfers add to 0
// // - transfers correspond to net settlement amounts
// // - previous balances + transfers correspond to current balances
// // - accounts correspond one-to-one to the accounts in the settlement (warning: there may be
// //   *more* accounts in the finalization file than in the settlement)
// // - at least two participants in the settlement
// // Error:
// // - account ID, participant ID, participant name correspond correctly
// // - account is POSITION type (SHOULD it be? Probably: it should be the position account in the
// //   settlement data generated by the switch)
// // - monetary amounts have correct number of decimal places for currency
// }

export enum SettlementReportValidationKind {
  SettlementIdNonMatching = 'selected settlement ID does not match report settlement ID',
  TransfersSumNonZero = 'sum of transfers in the report is non-zero',
  TransferDoesNotMatchNetSettlementAmount = 'transfer amount does not match net settlement amount',
  BalanceNotAsExpected = 'balance not modified corresponding to transfer amount',
  AccountsNotPresent = 'accounts in settlement not present in report',
  ExtraAccountsPresent = 'accounts in report not present in settlement',
  ReportIdentifiersNonMatching = 'report identifiers do not match - participant ID, account ID and participant name must match',
  AccountIsIncorrectType = 'account type should be POSITION',
  MonetaryAmountsInvalid = 'monetary amounts not valid for currency',
  InvalidAccountId = 'report account ID does not exist in switch',
}

export function describeSettlementReportValidation(validation: SettlementReportValidationKind) {
  switch (validation) {
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
    case SettlementReportValidationKind.BalanceNotAsExpected:
      return (
        'The transfer amount in the settlement finalization report is added to or subtracted from (as ' +
        'appropriate) the current liquidity account balance value in the switch. The result is expected to be equal ' +
        'to the new liquidity account balance in the settlement finalization report. These may not be equal if ' +
        'funds have been added to or removed from the switch liquidity account balance since settlement initiation.'
      );
    case SettlementReportValidationKind.AccountsNotPresent:
    case SettlementReportValidationKind.ExtraAccountsPresent:
    case SettlementReportValidationKind.ReportIdentifiersNonMatching:
      return (
        'The participant ID, account ID and participant name provided in the switch identifiers column of the ' +
        'settlement finalization report did not match each other. When the account ID was looked up, it did not ' +
        'match the ID of the settlement participant, or the name of the participant.'
      );
    case SettlementReportValidationKind.AccountIsIncorrectType:
    case SettlementReportValidationKind.MonetaryAmountsInvalid:
    case SettlementReportValidationKind.InvalidAccountId:
    default: {
      // Did you get a compile error here? This code is written such that if every
      // case in the above switch state is not handled, compilation will fail.
      const exhaustiveCheck: never = validation;
      throw new Error(`Unhandled validation: ${exhaustiveCheck}`);
    }
  }
}

export type SettlementReportValidation =
  | {
      kind: SettlementReportValidationKind.SettlementIdNonMatching;
      data: {
        reportId: number;
        settlementId: number;
      };
    }
  | { kind: SettlementReportValidationKind.TransfersSumNonZero }
  | {
      kind: SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount;
      data: {
        row: SettlementReportRow;
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
        account: LedgerAccount;
      };
    }
  | {
      kind: SettlementReportValidationKind.AccountsNotPresent;
      data: {
        participant?: FspName;
        account: SettlementParticipantAccount;
      }[];
    }
  | {
      kind: SettlementReportValidationKind.InvalidAccountId;
      data: SettlementReportEntry[];
    }
  | {
      kind: SettlementReportValidationKind.ExtraAccountsPresent;
      data: {
        participant?: FspName;
        entry: SettlementReportEntry;
      }[];
    }
  | {
      kind: SettlementReportValidationKind.ReportIdentifiersNonMatching;
      data: { row: SettlementReportRow };
    }
  | {
      kind: SettlementReportValidationKind.AccountIsIncorrectType;
      data: LedgerAccount;
    }
  | {
      kind: SettlementReportValidationKind.MonetaryAmountsInvalid;
      data: { row: SettlementReportRow };
    };

export function validateReport(
  report: SettlementReport,
  data: SettlementFinalizeData,
  settlement: Settlement,
): Set<SettlementReportValidation> {
  const result = new Set<SettlementReportValidation>();
  // Because no currency has more than four decimal places, we can have quite a large epsilon value
  const EPSILON = 1e-5;
  const equal = (a: number, b: number) => Math.abs(a - b) > EPSILON;

  // SettlementIdNonMatching = 'selected settlement ID does not match report settlement ID',
  if (settlement.id !== report.settlementId) {
    result.add({
      kind: SettlementReportValidationKind.SettlementIdNonMatching,
      data: {
        reportId: report.settlementId,
        settlementId: settlement.id,
      },
    });
  }

  // TransfersSumNonZero = 'sum of transfers in the report is non-zero',
  const reportTransfersSum = report.entries.reduce((sum, e) => sum + e.transferAmount, 0);
  if (!equal(reportTransfersSum, 0)) {
    result.add({ kind: SettlementReportValidationKind.TransfersSumNonZero });
  }

  // TransferDoesNotMatchNetSettlementAmount = 'transfer amount does not match net settlement amount',
  report.entries.forEach((entry) => {
    const spa = data.settlementParticipantAccounts.get(entry.positionAccountId);
    if (spa && entry.transferAmount === spa.netSettlementAmount.amount) {
      result.add({
        kind: SettlementReportValidationKind.TransferDoesNotMatchNetSettlementAmount,
        data: {
          row: entry.row,
          account: spa,
        },
      });
    }
  });

  // TODO: should we notify anyone about this? Perhaps not; sometimes the balance will change as a
  // result of normal business processes.
  // BalancesNotAsExpected = 'balances not modified corresponding to transfer amounts',
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

  // AccountsNotPresent = 'accounts in settlement not present in report',
  const reportAccountIds = new Set(report.entries.map((entry) => entry.positionAccountId));
  const accountsNotInReport = settlement.participants.flatMap((p) => p.accounts.filter((acc) => !reportAccountIds.has(acc.id)));
  if (accountsNotInReport.length !== 0) {
    result.add({
      kind: SettlementReportValidationKind.AccountsNotPresent,
      data: accountsNotInReport.map((account) => ({
        participant: data.accountsParticipants.get(account.id)?.participant.name,
        account,
      })),
    });
  }

  // InvalidAccountId = 'report account ID does not exist in switch',
  const invalidAccounts = report.entries.filter((entry) => !data.accountsParticipants.has(entry.positionAccountId));
  if (invalidAccounts.length !== 0) {
    result.add({
      kind: SettlementReportValidationKind.InvalidAccountId,
      data: invalidAccounts,
    });
  }

  // ExtraAccountsPresent = 'accounts in report not present in settlement',
  const settlementAccountIds = new Set(settlement.participants.flatMap((p) => p.accounts.map((acc) => acc.id)));
  const entriesNotInSettlement = report.entries.filter((entry) => !settlementAccountIds.has(entry.positionAccountId));
  if (entriesNotInSettlement.length !== 0) {
    result.add({
      kind: SettlementReportValidationKind.ExtraAccountsPresent,
      data: entriesNotInSettlement.map((entry) => ({
        entry,
        participant: data.accountsParticipants.get(entry.positionAccountId)?.participant.name,
      })),
    });
  }

  // ReportIdentifiersNonMatching = 'report identifiers do not match - participant ID, account ID and participant name must match',
  report.entries.forEach((entry) => {
    const switchParticipant = data.accountsParticipants.get(entry.positionAccountId);
    const settlementParticipantId = data.settlementParticipants.get(entry.positionAccountId)?.id;
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
          data: { row: entry.row },
        });
      }
    }
  });

  return result;
  // AccountIsIncorrectType = 'account type should be POSITION',
  // MonetaryAmountsInvalid = 'monetary amounts not valid for currency',
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
      ws.getRows(7, endOfData - startOfData)?.map((r) => {
        const switchIdentifiers = r.getCell(PARTICIPANT_INFO_COL).text;
        // TODO: check valid FSP name. It *should* be ASCII; because it has to go into an HTTP
        // header verbatim, and HTTP headers are restricted to printable ASCII. However, the ML
        // spec might differently, or further restrict it.
        const re = /^([0-9]+) ([0-9]+) ([a-zA-Z][a-zA-Z0-9]+)$/g;
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
