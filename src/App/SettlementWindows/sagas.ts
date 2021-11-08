import { strict as assert } from 'assert';
import apis from 'utils/apis';
import { SettlementStatus, DFSP, Settlement, ParticipantAccount, Currency } from '../types';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import {
  REQUEST_SETTLEMENT_WINDOWS,
  SETTLE_SETTLEMENT_WINDOWS,
  CLOSE_SETTLEMENT_WINDOW_MODAL,
  REQUEST_CLOSE_SETTLEMENT_WINDOW,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
  SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
  CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
  CLEAR_SETTLEMENT_WINDOWS_FILTERS,
  SettlementWindow,
} from './types';
import {
  requestSettlementWindows,
  setSettlementWindows,
  setSettlementWindowsError,
  setCloseSettlementWindowFinished,
  setSettleSettlementWindowsError,
  setSettleSettlementWindowsFinished,
} from './actions';

import { getCheckedSettlementWindows, getSettlementWindowsFilters } from './selectors';
import * as helpers from './helpers';

function* fetchSettlementWindows() {
  try {
    const filters = yield select(getSettlementWindowsFilters);
    const params = helpers.buildFiltersParams(filters);

    console.log('fetchSettlementWindows 0');

    const thing = yield call(setNdcToNetLiquidity);

    console.log('fetchSettlementWindows 1');

    const response = yield call(apis.settlementWindows.read, {
      params,
    });
    // Because when we call
    //   GET /v2/settlementWindows?fromDateTime=2021-06-29T23:00:00.000Z&toDateTime=2021-06-30T22:59:59.999Z
    // and there are no windows, central settlement returns
    //   400 Bad Request
    //   {
    //     "errorInformation": {
    //       "errorCode": "3100",
    //       "errorDescription": "Generic validation error - settlementWindow by filters: {fromDateTime:2021-06-29T23:00:00.000Z,toDateTime:2021-06-30T22:59:59.999Z} not found"
    //     }
    //   }
    // We translate this response to an empty array.
    // Source here:
    //   https://github.com/mojaloop/central-settlement/blob/45ecfe32d1039870aa9572e23747c24cd6d53c86/src/domain/settlementWindow/index.js#L75
    if (
      response.status === 400 &&
      /Generic validation error.*not found/.test(response.data?.errorInformation?.errorDescription)
    ) {
      yield put(setSettlementWindows([]));
    } else {
      yield put(setSettlementWindows(response.data));
    }
  } catch (e) {
    console.error(e);
    yield put(setSettlementWindowsError(e.message));
  }
}

export function* FetchSettlementWindowsSaga(): Generator {
  yield takeLatest([REQUEST_SETTLEMENT_WINDOWS, CLOSE_SETTLEMENT_WINDOW_MODAL], fetchSettlementWindows);
}

function* fetchSettlementWindowsAfterFiltersChange(action: PayloadAction) {
  // we try to set a delay for when the user is typing
  if (action.payload !== undefined) {
    yield delay(500);
  }
  yield put(requestSettlementWindows());
}

export function* FetchSettlementWindowsAfterFiltersChangeSaga(): Generator {
  yield takeLatest(
    [
      SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
      SELECT_SETTLEMENT_WINDOWS_FILTER_DATE_VALUE,
      CLEAR_SETTLEMENT_WINDOWS_FILTER_DATE_RANGE,
      SET_SETTLEMENT_WINDOWS_FILTER_VALUE,
      CLEAR_SETTLEMENT_WINDOWS_FILTER_STATE,
      CLEAR_SETTLEMENT_WINDOWS_FILTERS,
    ],
    fetchSettlementWindowsAfterFiltersChange,
  );
}

function* setNdcToNetLiquidity() {
  interface FullAccount extends ParticipantAccount {
    value: number;
  }
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
  const accountParticipants = new Map(
    [...participantAccounts.entries()].flatMap(([name, accounts]) => accounts.map((acc) => [acc.id, name]))
  )
  console.log(accountParticipants);
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

  // Flatten, then call
  yield all([...participantNetLiquidities.entries()].flatMap(([name, netLiquidities]) =>
    [...netLiquidities.entries()].map(([currency, netLiquidityAmount]) =>
      call(apis.netdebitcap.create, {
        dfspName: name,
        body: { newValue: netLiquidityAmount, currency },
      })
    )
  ));
}

function* settleWindows() {
  try {
    const windows: SettlementWindow[] = yield select(getCheckedSettlementWindows);
    const settlementResponse = yield call(apis.settleSettlementWindows.create, {
      body: {
        settlementModel: 'DEFERREDNET',
        reason: 'Business Operations Portal request',
        settlementWindows: windows.map((w) => ({ id: w.settlementWindowId })),
      },
    });

    assert(settlementResponse.status === 200, 'Unable to settle settlement window');

    yield put(setSettleSettlementWindowsFinished(settlementResponse.id));
  } catch (e) {
    console.error(e);
    yield put(setSettleSettlementWindowsError(e.message));
  }
}

export function* SettleSettlementWindowsSaga(): Generator {
  yield takeLatest(SETTLE_SETTLEMENT_WINDOWS, settleWindows);
}

function* closeSettlementWindow(action: PayloadAction<SettlementWindow>) {
  try {
    // This is obviously not a create. Obviously, it *should* be an update, but the central
    // settlement API is a bit funky in this regard.
    // https://github.com/mojaloop/central-settlement/blob/e3c8cf8fc61543d1ab70880765ced23a9e98cb25/src/interface/swagger.json#L96
    const response = yield call(apis.closeSettlementWindow.create, {
      settlementWindowId: action.payload.settlementWindowId,
      body: {
        state: 'CLOSED',
        reason: 'Business operations portal request',
      },
    });

    if (response !== 200) {
      const info = response.data.errorInformation;
      const msg = !info ? '' : ` due to error ${info.errorCode}: "${info.errorDescription}"`;
      throw new Error(`Unable to Close Window${msg}`);
    }

    yield put(setCloseSettlementWindowFinished());
    yield put(requestSettlementWindows());
  } catch (e) {
    console.error(e);
    yield put(setSettlementWindowsError(e.message));
  }
}

export function* CloseSettlementWindowsSaga(): Generator {
  yield takeLatest(REQUEST_CLOSE_SETTLEMENT_WINDOW, closeSettlementWindow);
}

export default function* rootSaga(): Generator {
  yield all([
    FetchSettlementWindowsSaga(),
    SettleSettlementWindowsSaga(),
    CloseSettlementWindowsSaga(),
    FetchSettlementWindowsAfterFiltersChangeSaga(),
  ]);
}
