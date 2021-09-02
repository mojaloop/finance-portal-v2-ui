import { composeOptions } from '@modusbox/modusbox-ui-components/dist/utils/html';
import { DateRanges, SettlementStatus } from './types';

export const dateRanges = composeOptions({
  [DateRanges.Today]: DateRanges.Today,
  [DateRanges.TwoDays]: DateRanges.TwoDays,
  [DateRanges.OneWeek]: DateRanges.OneWeek,
  [DateRanges.OneMonth]: DateRanges.OneMonth,
  [DateRanges.Custom]: DateRanges.Custom,
});

export const settlementStatuses = composeOptions({
  'Pending Settlement': SettlementStatus.PendingSettlement,
  'PS Transfers Recorded': SettlementStatus.PsTransfersRecorded,
  'PS Transfers Reserved': SettlementStatus.PsTransfersReserved,
  'PS Transfers Committed': SettlementStatus.PsTransfersCommitted,
  Settling: SettlementStatus.Settling,
  Settled: SettlementStatus.Settled,
  Aborted: SettlementStatus.Aborted,
});
