import moment from 'moment';
import { DateRanges, SettlementWindow, SettlementWindowFilters /* SettlementWindowStatus */ } from './types';

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

export function formatDate(date: string | undefined): string | undefined {
  if (!date) {
    return undefined;
  }
  return moment(date).format('DD/MM/YYYY LT z');
}

export function buildFiltersParams(filters: SettlementWindowFilters) {
  return {
    state: filters.state,
    fromDateTime: filters.start ? moment(filters.start).toISOString() : undefined,
    toDateTime: filters.end ? moment(filters.end).toISOString() : undefined,
  };
}

/* @ts-ignore */
export function mapApiToModel(item: any): SettlementWindow {
  return {
    settlementWindowId: item.settlementWindowId,
    state: item.state,
    createdDate: item.settlementWindowOpen,
    changedDate: item.settlementWindowClose || '',
  };
}
