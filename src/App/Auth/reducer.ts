import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, UserInfo } from './types';
import {
  setUsername,
  setPassword,
  requestLogout,
  setLogoutSucceeded,
  setLogoutFailed,
  requestLogin,
  requestUserInfo,
  setLoginSucceeded,
  setLoginFailed,
  setUserInfo,
} from './actions';

const initialState: AuthState = {
  username: '',
  password: '',
  loginError: null,
  isLoginPending: false,
  isLoginSucceeded: false,
  isLoginFailed: false,
  isLogoutPending: false,
  isLogoutFailed: false,
  userInfo: null,
  userInfoPending: false,
};

export default createReducer(initialState, (builder) =>
  builder
    .addCase(setUsername, (state: AuthState, action: PayloadAction<string>) => ({
      ...state,
      username: action.payload,
    }))
    .addCase(setPassword, (state: AuthState, action: PayloadAction<string>) => ({
      ...state,
      password: action.payload,
    }))
    .addCase(requestLogin, (state: AuthState) => ({
      ...state,
      loginError: initialState.loginError,
      isLoginFailed: initialState.isLoginFailed,
      isLoginSucceeded: initialState.isLoginSucceeded,
      isLoginPending: true,
    }))
    .addCase(setLoginSucceeded, (state: AuthState) => ({
      ...state,
      loginError: initialState.loginError,
      isLoginFailed: false,
      isLoginSucceeded: true,
      isLoginPending: false,
      password: initialState.password, // reset password immediately after login so at least *we* are less likely to leak it somewhere
    }))
    .addCase(setLoginFailed, (state: AuthState, action: PayloadAction<string | undefined>) => ({
      ...state,
      loginError: action.payload || 'There was an error',
      isLoginFailed: true,
      isLoginSucceeded: false,
      isLoginPending: false,
    }))
    .addCase(requestLogout, (state: AuthState) => ({
      ...state,
      isLogoutFailed: false,
      isLogoutPending: true,
      userInfo: null,
    }))
    .addCase(setLogoutSucceeded, (state: AuthState) => ({
      ...state,
      // reset login
      isLoginFailed: initialState.isLoginFailed,
      isLoginSucceeded: initialState.isLoginSucceeded,
      isLoginPending: initialState.isLoginPending,
      username: initialState.username,
      password: initialState.password,
      // set logout
      isLogoutFailed: false,
      isLogoutPending: false,
    }))
    .addCase(setLogoutFailed, (state: AuthState) => ({
      ...state,
      isLogoutFailed: true,
      isLogoutPending: false,
    }))
    .addCase(requestUserInfo, (state: AuthState) => ({
      ...state,
      userInfoPending: true,
    }))
    .addCase(setUserInfo, (state: AuthState, action: PayloadAction<UserInfo>) => ({
      ...state,
      userInfo: action.payload,
      userInfoPending: false,
    })),
);
