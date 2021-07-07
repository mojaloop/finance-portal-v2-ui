import apis from 'utils/apis';
import { all, call, put, takeLatest } from 'redux-saga/effects';
import { REQUEST_DFSPS } from './types';
import { setDfsps, setDfspsError } from './actions';

function* fetchDfsps() {
  try {
    const response = yield call(apis.dfsps.read, {});
    yield put(setDfsps(response.data));
  } catch (e) {
    yield put(setDfspsError(e.message));
  }
}

export function* FetchDfspsSaga(): Generator {
  yield takeLatest(REQUEST_DFSPS, fetchDfsps);
}

export default function* rootSaga(): Generator {
  yield all([FetchDfspsSaga()]);
}
