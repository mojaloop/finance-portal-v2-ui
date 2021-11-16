import { strict as assert } from 'assert';
import moment from 'moment';
import ExcelJS, { ValueType } from 'exceljs';
import { SettlementReport, DateRanges, SettlementStatus, SettlementFilters } from './types';

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

    /* @ts-ignore */
    amounts: item.participants.map((c: any) => {
      /* @ts-ignore */
      return c.accounts.reduce((pp: number, cc: any) => pp + cc.netSettlementAmount.amount, 0);
    }, 0),
    totalValue: item.participants.reduce((p: number, c: any) => {
      /* @ts-ignore */
      return p + c.accounts.reduce((pp: number, cc: any) => pp + Math.max(cc.netSettlementAmount.amount, 0), 0);
    }, 0),
    totalVolume: (Math.random() * 1000000).toFixed(2),
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
// // - accounts correspond to the accounts in the settlement
// // - at least two participants in the settlement
// // Error:
// // - account ID, participant ID, participant name correspond correctly
// // - account is POSITION type (SHOULD it be? Probably: it should be the position account in the
// //   settlement data generated by the switch)
// // - monetary amounts have correct number of decimal places for currency
// }

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
export function loadWorksheetData(buf: ArrayBuffer): PromiseLike<SettlementReport> {
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
        const participantInfoCellContent = r.getCell(PARTICIPANT_INFO_COL).text;
        // TODO: check valid FSP name. It *should* be ASCII; because it has to go into an HTTP
        // header verbatim, and HTTP headers are restricted to printable ASCII. However, the ML
        // spec might differently, or further restrict it.
        const re = /^(?<idText>[0-9]+) (?<accountIdText>[0-9]+) (?<name>[a-zA-Z][a-zA-Z0-9]+)$/;
        const match = re.exec(participantInfoCellContent);
        assert(
          match !== null && match.groups,
          `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${participantInfoCellContent}]. Matching regex: ${re}`,
        );
        const { idText, accountIdText, name } = match.groups;
        const [id, positionAccountId] = [Number(idText), Number(accountIdText)];
        assert(
          !Number.isNaN(id) && !Number.isNaN(positionAccountId) && name,
          `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${participantInfoCellContent}]`,
        );

        const balanceCell = r.getCell(BALANCE_COL);
        assert(
          balanceCell.type === ValueType.Number,
          `Unable to extract account balance from ${BALANCE_COL}${r.number}. Cell data type is not numeric.`,
        );
        const balance = Number(balanceCell.value);
        assert(
          balanceCell.value !== null &&
            balanceCell.value !== undefined &&
            balanceCell.text !== '' &&
            !Number.isNaN(balance),
          `Unable to extract account balance from ${BALANCE_COL}${r.number}. Cell contents: [${balanceCell.text}]`,
        );

        const transferAmountCell = r.getCell(TRANSFER_AMOUNT_COL);
        assert(
          transferAmountCell.type === ValueType.Number,
          `Unable to extract transfer amount from ${TRANSFER_AMOUNT_COL}${r.number}. Cell data type is not numeric.`,
        );
        const transferAmount = Number(transferAmountCell.value);
        assert(
          transferAmountCell.value !== null &&
            transferAmountCell.value !== undefined &&
            transferAmountCell.text !== '' &&
            !Number.isNaN(transferAmount),
          `Unable to extract transfer amount from ${TRANSFER_AMOUNT_COL}${r.number}. Cell contents: [${transferAmountCell.text}]`,
        );

        return {
          participant: {
            id,
            name,
          },
          positionAccountId,
          balance,
          transferAmount,
        };
      }) || [];

    return {
      settlementId,
      entries,
    };
  });
}
