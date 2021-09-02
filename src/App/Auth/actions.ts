import { createAction } from '@reduxjs/toolkit';
import {
  REQUEST_LOGIN,
  REQUEST_TOKEN,
  CHECK_TOKEN,
  SET_IS_TOKEN_VALID,
  SET_TOKEN,
  SET_TOKEN_ERROR,
  SET_USERNAME,
  SET_PASSWORD,
  SET_LOGIN_SUCCEEDED,
  SET_LOGIN_FAILED,
  SET_LOGOUT_SUCCEEDED,
  SET_LOGOUT_FAILED,
  REQUEST_LOGOUT,
} from './types';

export const requestToken = createAction(REQUEST_TOKEN);
export const checkToken = createAction(CHECK_TOKEN);
export const setToken = createAction<string>(SET_TOKEN);
export const setTokenError = createAction<string>(SET_TOKEN_ERROR);

export const setUsername = createAction<string>(SET_USERNAME);
export const setPassword = createAction<string>(SET_PASSWORD);
export const requestLogin = createAction(REQUEST_LOGIN);
export const setLoginSucceeded = createAction(SET_LOGIN_SUCCEEDED);
export const setLoginFailed = createAction<string | undefined>(SET_LOGIN_FAILED);
export const setLogoutSucceeded = createAction(SET_LOGOUT_SUCCEEDED);
export const setLogoutFailed = createAction(SET_LOGOUT_FAILED);
export const requestLogout = createAction(REQUEST_LOGOUT);
export const setIsTokenValid = createAction<boolean>(SET_IS_TOKEN_VALID);
