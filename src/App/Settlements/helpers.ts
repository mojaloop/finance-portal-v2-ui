import moment from 'moment';
import { DateRanges, SettlementStatus, SettlementFilters } from './types';

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
    fromDateTime: filters.start ? moment(filters.start).toISOString() : undefined,
    toDateTime: filters.end ? moment(filters.end).toISOString() : undefined,
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
