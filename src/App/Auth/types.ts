import { ErrorMessage } from 'App/types';

export const SET_USERNAME = 'Auth / Set Username';
export const SET_PASSWORD = 'Auth / Set Password';
export const REQUEST_LOGIN = 'Auth / Request Login';
export const SET_LOGIN_SUCCEEDED = 'Auth / Set Login Succeeded';
export const SET_LOGIN_FAILED = 'Auth / Set Login Failed';
export const SET_LOGOUT_SUCCEEDED = 'Auth / Set Logout Succeeded';
export const SET_LOGOUT_FAILED = 'Auth / Set Logout Failed';
export const REQUEST_LOGOUT = 'Auth / Logout';
export const SET_USER_INFO = 'Auth / Set User Info';
export const REQUEST_USER_INFO = 'Auth / Request User Info';

export interface UserInfo {
  username: string;
}

export interface AuthState {
  username: string;
  password: string;
  loginError: ErrorMessage;
  isLoginPending: boolean;
  isLoginSucceeded: boolean;
  isLoginFailed: boolean;
  isLogoutPending: boolean;
  isLogoutFailed: boolean;
  userInfo?: UserInfo;
  userInfoPending: boolean;
}
