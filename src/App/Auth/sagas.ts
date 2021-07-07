import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import apis from '../../utils/apis';
import checkTokenCookie from '../../utils/auth';

import { REQUEST_LOGIN, CHECK_TOKEN } from './types';
import { setLoginSucceeded, setLoginFailed, setIsTokenValid } from './actions';
import { getUsername, getPassword } from './selectors';

function* checkToken() {
  const ok = yield call(checkTokenCookie);
  yield put(setIsTokenValid(ok));
}

function* CheckTokenSaga(): Generator {
  yield takeLatest(CHECK_TOKEN, checkToken);
}

function* login() {
  try {
    const username = yield select(getUsername);
    const password = yield select(getPassword);
    // Call finance-portal-backend-service POST /login
    const response = yield call(apis.login.create, { body: { username, password } });
    if (response.status === 200) {
      yield all([put(setLoginSucceeded()), put(setIsTokenValid(true))]);
    } else if (response.status === 401) {
      yield put(setLoginFailed('Wrong Credentials'));
    } else {
      yield put(setLoginFailed('Other Error'));
    }
  } catch (e) {
    yield put(setLoginFailed());
  }
}

export function* LoginSaga(): Generator {
  yield takeLatest(REQUEST_LOGIN, login);
}

export default function* rootSaga(): Generator {
  yield all([LoginSaga(), CheckTokenSaga()]);
}
