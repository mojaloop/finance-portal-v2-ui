import { State } from 'store/types';

export const getUsername = (state: State) => state.subApp.auth.username;
export const getPassword = (state: State) => state.subApp.auth.password;
export const getUserInfo = (state: State) => state.subApp.auth.userInfo;
export const getUserInfoPending = (state: State) => state.subApp.auth.userInfoPending;

export const getIsLogoutPending = (state: State) => state.subApp.auth.isLogoutPending;
export const getIsLogoutFailed = (state: State) => state.subApp.auth.isLogoutFailed;
export const getIsLoginPending = (state: State) => state.subApp.auth.isLoginPending;
export const getIsLoginSucceeded = (state: State) => state.subApp.auth.isLoginSucceeded;
export const getIsLoginFailed = (state: State) => state.subApp.auth.isLoginFailed;
export const getLoginError = (state: State) => state.subApp.auth.loginError;
