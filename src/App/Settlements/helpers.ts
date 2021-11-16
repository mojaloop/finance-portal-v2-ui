import { strict as assert } from 'assert';
import moment from 'moment';
import ExcelJS from 'exceljs';
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

export function readFileAsArrayBuffer(file: File): PromiseLike<ArrayBuffer> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    // TODO: better investigate usage of 'as ArrayBuffer'
    reader.onload = () => res(reader.result as ArrayBuffer);
    reader.onerror = rej;
    reader.readAsArrayBuffer(file);
  });
}

export function loadWorksheetData(buf: ArrayBuffer): PromiseLike<SettlementReport> {
  return new Promise((res) => {
    const wb = new ExcelJS.Workbook();
    wb.xlsx.load(buf).then(() => {
      const SETTLEMENT_ID_CELL = 'B1';
      const PARTICIPANT_INFO_COL = 'A';
      const BALANCE_COL = 'C';
      const TRANSFER_AMOUNT_COL = 'D';

      const ws = wb.getWorksheet(1);
      const settlementIdText = ws.getCell(SETTLEMENT_ID_CELL).text;
      const settlementId = Number(settlementIdText);
      assert(
        settlementId,
        `Unable to extract settlement ID from cell ${SETTLEMENT_ID_CELL}. Found: ${settlementIdText}`,
      );

      const startOfData = 7;
      let endOfData = 7;
      while (ws.getCell(`A${endOfData}`).text !== '') {
        endOfData += 1;
      }

      const entries =
        ws.getRows(7, endOfData - startOfData)?.map((r) => {
          const participantInfoCellContent = r.getCell(PARTICIPANT_INFO_COL).text;
          const [idText, accountIdText, name] = participantInfoCellContent.split(' ');
          const [id, positionAccountId] = [Number(idText), Number(accountIdText)];
          assert(
            id && positionAccountId && name,
            `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${participantInfoCellContent}]`,
          );

          const balanceText = r.getCell(BALANCE_COL).text;
          const balance = Number(balanceText);
          assert(
            balance,
            `Unable to extract account balance from ${BALANCE_COL}${r.number}. Cell contents: [${balanceText}]`,
          );

          const isNegative = /^\(\d+\)\)$/;
          const transferAmountText = r.getCell(TRANSFER_AMOUNT_COL).text.replace(',', '');
          const transferAmount = isNegative.test(transferAmountText)
            ? -Number(transferAmountText.replace(/(^\(|\)$)/g, ''))
            : Number(transferAmountText);
          assert(
            transferAmount,
            `Unable to extract transfer amount from ${BALANCE_COL}${r.number}. Cell contents: [${balanceText}]`,
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

      res({
        settlementId,
        entries,
      });
    });
  });
}
