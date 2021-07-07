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
  SET_LOGIN_SUCCEDED,
  SET_LOGIN_FAILED,
  LOGOUT,
} from './types';

export const requestToken = createAction(REQUEST_TOKEN);
export const checkToken = createAction(CHECK_TOKEN);
export const setToken = createAction<string>(SET_TOKEN);
export const setTokenError = createAction<string>(SET_TOKEN_ERROR);

export const setUsername = createAction<string>(SET_USERNAME);
export const setPassword = createAction<string>(SET_PASSWORD);
export const requestLogin = createAction(REQUEST_LOGIN);
export const setLoginSucceeded = createAction(SET_LOGIN_SUCCEDED);
export const setLoginFailed = createAction<string | undefined>(SET_LOGIN_FAILED);
export const logout = createAction(LOGOUT);
export const setIsTokenValid = createAction<boolean>(SET_IS_TOKEN_VALID);
