import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from './types';
import {
  setUsername,
  setPassword,
  requestLogout,
  setLogoutSucceeded,
  setLogoutFailed,
  requestLogin,
  setLoginSucceeded,
  setLoginFailed,
  setIsTokenValid,
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
  isTokenValid: null,
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
      password: initialState.password, // reset password immediately after login
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
    }))
    .addCase(setLogoutSucceeded, (state: AuthState) => ({
      ...state,
      // reset login
      isLoginFailed: initialState.isLoginFailed,
      isLoginSucceeded: initialState.isLoginSucceeded,
      isLoginPending: initialState.isLoginPending,
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
    .addCase(setIsTokenValid, (state: AuthState, action: PayloadAction<boolean>) => ({
      ...state,
      isTokenValid: action.payload,
    })),
);
