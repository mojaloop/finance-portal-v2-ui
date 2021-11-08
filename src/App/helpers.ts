import { strict as assert } from 'assert';
import { all, call } from 'redux-saga/effects';
import apis from '../utils/apis';

import { ParticipantAccount, Currency, SettlementStatus, DFSP, Settlement, ParticipantLimit } from './types';

export interface FullAccount extends ParticipantAccount {
  value: number;
}

export type FspId = string;

export function calculateNetLiquidity(
  unsettledSettlements: Settlement[],
  participantAccounts: Map<FspId, FullAccount[]>
): { name: FspId, currency: Currency, amount: number }[] {
  const accountParticipants = new Map(
    [...participantAccounts.entries()].flatMap(([name, accounts]) => accounts.map((acc) => [acc.id, name]))
  )
  console.log(accountParticipants);
  const unsettledAccounts = unsettledSettlements.flatMap((s) => s.participants.flatMap((p) => p.accounts));
  console.log(unsettledAccounts);
  const unsettledParticipants = new Set(unsettledAccounts.map((acc) => accountParticipants.get(acc.id)));
  console.log(unsettledParticipants);
  const participantUnsettledAmounts = new Map(
    [...unsettledParticipants.keys()].map(
      (p) => {
        assert(p !== undefined);
        const thisParticipantAccounts = participantAccounts.get(p);
        assert(thisParticipantAccounts !== undefined, 'Couldn\'t find participant accounts');
        const thisParticipantUnsettledAccounts = unsettledAccounts.filter(
          (acc) => thisParticipantAccounts.find((pa) => pa.id === acc.id)
        );
        const thisParticipantUnsettledCurrencies = new Set(thisParticipantUnsettledAccounts.map((acc) => acc.netSettlementAmount.currency));
        const thisParticipantUnsettledCurrencyValues = new Map([...thisParticipantUnsettledCurrencies]
          .map((curr) => [
            curr,
            thisParticipantUnsettledAccounts.reduce((sum, acc) => sum + (acc.netSettlementAmount.currency === curr ? acc.netSettlementAmount.amount : 0), 0)
          ]));
        return [
          p,
          thisParticipantUnsettledCurrencyValues,
        ]
      }
    )
  );
  console.log(participantUnsettledAmounts);

  // For each participant, for each unsettled (currency, amount), find the relevant
  // settlement/liquidity account balance to calculate the net liquidity
  const participantNetLiquidities = new Map([...participantUnsettledAmounts.entries()].map(([name, currencies]) => {
    const thisParticipantAccounts = participantAccounts.get(name);
    assert(thisParticipantAccounts !== undefined, 'Couldn\'t find participant accounts');
    const thisParticipantNetLiquidities = new Map([...currencies.entries()].map(([currency, unsettledAmount]) => {
      const liquidityBalance = thisParticipantAccounts.find(
        (pa) => pa.currency === currency && pa.ledgerAccountType === 'SETTLEMENT'
      )?.value;
      assert(
        liquidityBalance !== undefined,
        `Unable to retrieve ${currency} liquidity account balance for participant ${name}`,
      );
      return [currency, liquidityBalance - unsettledAmount];
    }));
    return [name, thisParticipantNetLiquidities];
  }))
  console.log(participantNetLiquidities);

  return [...participantNetLiquidities.entries()].flatMap(([name, netLiquidities]) =>
    [...netLiquidities.entries()].map(([currency, netLiquidityAmount]) => ({
      name,
      currency,
      amount: netLiquidityAmount,
    }))
  );
}

export function* setNdcToNetLiquidity() {
  const participantsResponse = yield call(apis.participants.read, {});
  assert(participantsResponse.status === 200, 'Failed to retrieve participants');
  const participantsSimple = participantsResponse.data;
  const participantAccounts = new Map<string, FullAccount[]>(yield all(
    participantsSimple.map((p: DFSP) => call(function* () {
      const accountsResponse = yield call(apis.participantAccounts.read, { participantName: p.name });
      assert(accountsResponse.status === 200, 'Failed to retrieve participant accounts');
      return yield all([
        p.name,
        accountsResponse.data,
      ]);
    }))
  ));
  console.log(participantAccounts);

  // Get all outstanding settlements
  const state = [
    SettlementStatus.PendingSettlement,
    SettlementStatus.PsTransfersCommitted,
    SettlementStatus.PsTransfersRecorded,
    SettlementStatus.PsTransfersReserved,
    SettlementStatus.Settling,
  ].join(',');
  const unsettledSettlementsResponse = yield call(apis.settlements.read, {
    params: {
      state,
    }
  });

  console.log('Set NDC to net liquidity 1');
  console.log(unsettledSettlementsResponse);

  // Because when we call
  //   GET /v2/settlements?some=filters
  // and there are no settlements, central settlement returns
  //   400 Bad Request
  //   {
  //     "errorInformation": {
  //       "errorCode": "3100",
  //       "errorDescription": "Generic validation error - Settlements not found"
  //     }
  //   }
  // Source here:
  //   https://github.com/mojaloop/central-settlement/blob/45ecfe32d1039870aa9572e23747c24cd6d53c86/src/domain/settlement/index.js#L218
  // In this case, we have nothing to do; so we return.
  if (
    unsettledSettlementsResponse.status === 400 &&
    /generic validation error.*not found/i.test(unsettledSettlementsResponse.data?.errorInformation?.errorDescription)
  ) {
    return;
  }

  const unsettledSettlements: Settlement[] = unsettledSettlementsResponse.data;
  console.log(unsettledSettlements);

  const currentLimitsResponse = yield call(apis.participantsLimits.read, {});
  assert(currentLimitsResponse.status === 200, 'Failed to retrieve participants limits');
  const currentLimits = new Map([...participantAccounts.keys()].map((name) => ([
    name,
    currentLimitsResponse.data
      .filter((lim: ParticipantLimit) => lim.name === name)
      .reduce(
        (map: Map<Currency, ParticipantLimit>, limit: ParticipantLimit) => map.set(limit.currency, limit),
        new Map<Currency, ParticipantLimit>()
      ),
  ])));

  yield all(calculateNetLiquidity(unsettledSettlements, participantAccounts).map(
    ({ name, currency, amount }) => {
      const currentNdc = currentLimits.get(name)?.get(currency);
      assert(currentNdc !== undefined, `Failed to retrieve current NDC for ${name}`);
      return call(apis.participantLimits.update, {
        participantName: name,
        body: {
          currency,
          limit: {
            ...currentNdc.limit,
            value: amount,
          },
        },
      })
    }
  ));
}
