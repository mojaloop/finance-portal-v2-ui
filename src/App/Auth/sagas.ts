import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import apis from '../../utils/apis';

import { REQUEST_LOGIN, REQUEST_LOGOUT, REQUEST_USER_INFO } from './types';
import { setLoginSucceeded, setLoginFailed, setLogoutFailed, setLogoutSucceeded, setUserInfo } from './actions';
import { getUsername, getPassword } from './selectors';

function* requestUserInfo() {
  const userInfo = yield call(apis.userInfo.read, {});
  if (userInfo.status === 200) {
    yield put(setUserInfo(userInfo.data));
  } else {
    yield put(setUserInfo(undefined));
  }
}

function* login() {
  try {
    const username = yield select(getUsername);
    const password = yield select(getPassword);
    // Call finance-portal-backend-service POST /login
    const response = yield call(apis.login.create, { body: { username, password } });
    if (response.status === 200) {
      yield all([put(setLoginSucceeded()), put(setUserInfo(response.data))]);
    } else if (response.status === 401) {
      yield put(setLoginFailed('Wrong Credentials'));
    } else {
      yield put(setLoginFailed('Other Error'));
    }
  } catch (e) {
    yield put(setLoginFailed());
  }
}

function* logout() {
  try {
    const response = yield call(apis.logout.update, {});
    if (response.status === 200) {
      yield put(setLogoutSucceeded());
    } else {
      yield put(setLogoutFailed());
    }
  } catch (e) {
    yield put(setLogoutFailed());
  }
}

export function* LoginSaga(): Generator {
  yield takeLatest(REQUEST_LOGIN, login);
}

export function* LogoutSaga(): Generator {
  yield takeLatest(REQUEST_LOGOUT, logout);
}

export function* RequestUserInfoSaga(): Generator {
  yield takeLatest(REQUEST_USER_INFO, requestUserInfo);
}

export default function* rootSaga(): Generator {
  yield all([LoginSaga(), RequestUserInfoSaga(), LogoutSaga()]);
}
