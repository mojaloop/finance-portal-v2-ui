import { ErrorMessage } from 'App/types';

export const REQUEST_TOKEN = 'Auth / Request Token';
export const SET_TOKEN = 'Auth / Set Token';
export const CHECK_TOKEN = 'Auth / Check Token';
export const SET_IS_TOKEN_VALID = 'Auth / Set Is Token Valid';
export const SET_TOKEN_ERROR = 'Auth / Set Token Error';
export const SET_USERNAME = 'Auth / Set Username';
export const SET_PASSWORD = 'Auth / Set Password';
export const REQUEST_LOGIN = 'Auth / Request Login';
export const SET_LOGIN_SUCCEEDED = 'Auth / Set Login Succeeded';
export const SET_LOGIN_FAILED = 'Auth / Set Login Failed';
export const SET_LOGOUT_SUCCEEDED = 'Auth / Set Logout Succeeded';
export const SET_LOGOUT_FAILED = 'Auth / Set Logout Failed';
export const REQUEST_LOGOUT = 'Auth / Logout';

export interface AuthState {
  username: string;
  password: string;
  loginError: ErrorMessage;
  isLoginPending: boolean;
  isLoginSucceeded: boolean;
  isLoginFailed: boolean;
  isLogoutPending: boolean;
  isLogoutFailed: boolean;
  isTokenValid: boolean | null;
}
