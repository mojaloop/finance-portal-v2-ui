import { createReducer, PayloadAction } from '@reduxjs/toolkit';
import { AuthState } from './types';
import {
  setUsername,
  setPassword,
  requestLogin,
  setLoginSucceeded,
  setLoginFailed,
  logout,
  setIsTokenValid,
} from './actions';

const initialState: AuthState = {
  username: '',
  password: '',
  loginError: null,
  isLoginPending: false,
  isLoginSucceeded: false,
  isLoginFailed: false,
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
    }))
    .addCase(setLoginFailed, (state: AuthState, action: PayloadAction<string | undefined>) => ({
      ...state,
      loginError: action.payload || 'There was an error',
      isLoginFailed: true,
      isLoginSucceeded: false,
      isLoginPending: false,
    }))
    .addCase(logout, (state: AuthState) => ({
      ...state,
      loginError: initialState.loginError,
      isLoginFailed: initialState.isLoginFailed,
      isLoginSucceeded: initialState.isLoginSucceeded,
      isLoginPending: initialState.isLoginPending,
      username: initialState.username,
      password: initialState.password,
    }))
    .addCase(setIsTokenValid, (state: AuthState, action: PayloadAction<boolean>) => ({
      ...state,
      isTokenValid: action.payload,
    })),
);
