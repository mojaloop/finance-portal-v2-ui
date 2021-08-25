// import { composeOptions } from '@modusbox/modusbox-ui-components/dist/utils/html';
import { DateRanges, SettlementStatus } from './types';

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

export const settlementStatuses = composeOptions({
  'Pending Settlement:': SettlementStatus.PendingSettlement,
  'Ps Transfers Recorded': SettlementStatus.PsTransfersRecorded,
  'Ps Transfers Reserved': SettlementStatus.PsTransfersReserved,
  'Ps Transfers Committed': SettlementStatus.PsTransfersCommitted,
  Settling: SettlementStatus.Settling,
  Settled: SettlementStatus.Settled,
  Aborted: SettlementStatus.Aborted,
});
