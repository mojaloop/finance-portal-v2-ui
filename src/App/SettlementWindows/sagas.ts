import { strict as assert } from 'assert';
import apis from 'utils/apis';
import { SettlementStatus, DFSP, Settlement, Currency } from '../types';
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
  // The net liquidity amount is defined as the balance in the settlement/liquidity account less
  // the sum of all unsettled amounts

  // Get settlement/liquidity account balances for participants in this settlement. Because the
  // settlement service API works with participant IDs instead of participant names, we have to
  // work backwards from account IDs.
  const participants = yield call(apis.participants.read);

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
    /Generic validation error.*not found/.test(unsettledSettlementsResponse.data?.errorInformation?.errorDescription)
  ) {
    return;
  }

  const unsettledSettlements: Settlement[] = unsettledSettlementsResponse.data;

  interface ParticipantUnsettledDebit {
    name: string;
    outstanding: { currency: Currency; amount: number; }[];
  }

  // Correlate unsettled settlement accounts to participants
  // This is quite awkward because central ledger returns participants with a `.name` identifier,
  // but no `.id` identified, whereas central settlement returns participants with a `.id`
  // identifier, and no `.name` identifier. See:
  // https://github.com/mojaloop/project/issues/2408
  const participantsUnsettledDebits =
    participants
      .map((p: DFSP): ParticipantUnsettledDebit => {
        const participantAccounts = new Map(p.accounts.map((a) => ([a.id, a])));
        const allUnsettledAccounts = unsettledSettlements.flatMap((s) =>
          s.participants.flatMap((sp) => sp.accounts.filter((spa) =>
            participantAccounts.has(spa.id)))
        );
        const currencies = new Set(allUnsettledAccounts.map((a) => a.netSettlementAmount.currency));
        const outstanding = [...currencies.values()].map((currency) => ({
          currency,
          amount: allUnsettledAccounts
            .filter((a) => a.netSettlementAmount.currency === currency)
            .reduce((accum, account) => accum + account.netSettlementAmount.amount, 0)
        })).filter(({ amount }) => amount > 0);
        return {
          name: p.name,
          outstanding,
        };
      })
      .filter(({ outstanding }: ParticipantUnsettledDebit) => outstanding.length > 0)
      // .flatMap(({ name, outstanding }: ParticipantUnsettledDebit) => outstanding.map((os) => ({
      //   name,
      //   ...os
      // })));

  const participantSettlementAccounts = new Map(
    (yield all(
      participantsUnsettledDebits.map((p: ParticipantUnsettledDebit) => call(
        apis.participantAccounts.read, { participantName: p.name }
      ))
    )).map( => )
  );

  const participantSettlementAccountBalances = new Map(participants.map((p) => ([
    p.name,
    new Map(p.accounts.filter((a) => a.ledgerAccountType !== 'POSITION').map((a) => ([a.currency, a])))
  ])))

  yield all(participantsUnsettledDebits.map(({ name, currency, amount }) => {
    call(apis.netdebitcap.create, {
      body: { newValue:  }
    })
  }))
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
