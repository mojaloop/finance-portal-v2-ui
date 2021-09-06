import { createAction } from '@reduxjs/toolkit';
import {
  REQUEST_LOGIN,
  SET_USERNAME,
  SET_PASSWORD,
  SET_LOGIN_SUCCEEDED,
  SET_LOGIN_FAILED,
  SET_LOGOUT_SUCCEEDED,
  SET_LOGOUT_FAILED,
  REQUEST_USER_INFO,
  REQUEST_LOGOUT,
  SET_USER_INFO,
  UserInfo,
} from './types';

export const requestUserInfo = createAction(REQUEST_USER_INFO);
export const setUserInfo = createAction<UserInfo | undefined>(SET_USER_INFO);
export const setUsername = createAction<string>(SET_USERNAME);
export const setPassword = createAction<string>(SET_PASSWORD);
export const requestLogin = createAction(REQUEST_LOGIN);
export const setLoginSucceeded = createAction(SET_LOGIN_SUCCEEDED);
export const setLoginFailed = createAction<string | undefined>(SET_LOGIN_FAILED);
export const setLogoutSucceeded = createAction(SET_LOGOUT_SUCCEEDED);
export const setLogoutFailed = createAction(SET_LOGOUT_FAILED);
export const requestLogout = createAction(REQUEST_LOGOUT);
