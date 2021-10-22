import { is200, is401 } from '@modusbox/ts-utils/lib/http';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import axios from 'axios';
import * as selectors from './selectors';
import { actions } from './slice';

function* doAuth() {
  try {
    console.log(yield select(selectors.getAuthTokenEndpoint));
    const authTokenEndpoint: string = yield select(selectors.getAuthTokenEndpoint);
    const apiCall = () => {
      return axios
        .get(authTokenEndpoint, {
          withCredentials: true,
        })
        .then((response) => {
          return response;
        })
        .catch((err) => {
          return err.response;
        });
    };

    const { data, status } = yield call(apiCall);
    if (is200(status)) {
      yield put(actions.doAuthSuccess(data));
    } else if (is401(status)) {
      window.location.href = yield select(selectors.getLoginEndpoint);
    } else {
      yield put(actions.doAuthFailed('There was an error while performing authentication. Please try again later'));
    }
  } catch (e) {
    yield put(actions.doAuthFailed('Currently unable to perform authentication. Please try again later'));
  }
}

function* logout() {
  const logoutEndpoint: string = yield select(selectors.getLogoutEndpoint);
  const apiCall = () => {
    return axios
      .get(logoutEndpoint, {
        withCredentials: true,
      })
      .then((response) => {
        return response;
      })
      .catch((err) => {
        return err.response;
      });
  };

  const { data } = yield call(apiCall);
  window.location.href = data.logout_url;
}

function* doAuthSaga() {
  yield takeLatest([actions.doAuth.type], doAuth);
}

function* logoutSaga() {
  yield takeLatest([actions.logout.type], logout);
}

export default function* rootSaga() {
  yield all([doAuthSaga(), logoutSaga()]);
}
