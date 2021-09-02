// Removed because we reverted the version of this package due to a bug
// import { composeOptions } from '@modusbox/modusbox-ui-components/dist/utils/html';
import { DateRanges, SettlementWindowStatus } from './types';

const composeOptions = (opts: any) => {
  return Object.keys(opts).map((k) => ({
    label: k,
    value: opts[k],
  }));
};

export const dateRanges = composeOptions({
  [DateRanges.Today]: DateRanges.Today,
  [DateRanges.TwoDays]: DateRanges.TwoDays,
  [DateRanges.OneWeek]: DateRanges.OneWeek,
  [DateRanges.OneMonth]: DateRanges.OneMonth,
  [DateRanges.Custom]: DateRanges.Custom,
});

export const settlementWindowStatuses = composeOptions({
  Open: SettlementWindowStatus.Open,
  Closed: SettlementWindowStatus.Closed,
  Pending: SettlementWindowStatus.Pending,
  Settled: SettlementWindowStatus.Settled,
  Aborted: SettlementWindowStatus.Aborted,
});
