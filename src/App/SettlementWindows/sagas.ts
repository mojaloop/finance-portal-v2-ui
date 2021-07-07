import apis from 'utils/apis';
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
      yield put(setSettlementWindows(response.data.map(helpers.mapApiToModel)));
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

function* settleSingleWindow(settlementWindow: SettlementWindow) {
  const { settlementWindowId } = settlementWindow;
  const windowResponse = yield call(apis.settlementWindow.read, {
    settlementWindowId,
  });
  const {
    settlementId,
    settlement: { participants },
  } = windowResponse.data;

  const settlementResponse = yield call(apis.settleSettlementWindow.update, {
    settlementWindowId,
    body: {
      endDate: new Date().toISOString(),
      participants,
      settlementId,
      startDate: settlementWindow.createdDate,
    },
  });

  if (settlementResponse.status !== 200) {
    throw new Error('Unable to settle settlement window');
  }

  return settlementId;
}

function* settleSettlementWindow() {
  try {
    const settlementWindows = yield select(getCheckedSettlementWindows);

    const ids = yield all(
      settlementWindows.map((settlementWindow: SettlementWindow) => call(settleSingleWindow, settlementWindow)),
    );
    // @ts-ignore

    yield put(setSettleSettlementWindowsFinished(ids));
  } catch (e) {
    yield put(setSettleSettlementWindowsError(e.message));
  }
}

export function* SettleSettlementWindowsSaga(): Generator {
  yield takeLatest(SETTLE_SETTLEMENT_WINDOWS, settleSettlementWindow);
}

function* closeSettlementWindow(action: PayloadAction<SettlementWindow>) {
  try {
    const response = yield call(apis.closeSettlementWindow.update, {
      settlementWindowId: action.payload.settlementWindowId,
      body: {
        startDate: new Date(action.payload.createdDate).toISOString(),
        endDate: new Date().toISOString(),
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
