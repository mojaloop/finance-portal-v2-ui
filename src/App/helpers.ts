import { Settlement, SettlementStatus } from './types';

export function buildUpdateSettlementStateRequest(settlement: Readonly<Settlement>, state: SettlementStatus) {
  return {
    settlementId: settlement.id,
    body: {
      participants: settlement.participants.map((p) => ({
        ...p,
        accounts: p.accounts.map((a) => ({
          id: a.id,
          reason: 'Business operations portal request',
          state,
        })),
      })),
    },
  };
}
