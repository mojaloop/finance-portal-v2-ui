import { createSelector } from 'reselect';
import { State } from 'store';

export const getIsAuthEnabled = (state: State) => state.config.kratosAuth.isAuthEnabled;
export const getLoginEndpoint = (state: State) => state.config.kratosAuth.loginEndpoint;
export const getLogoutEndpoint = (state: State) => state.config.kratosAuth.logoutEndpoint;
export const getAuthTokenEndpoint = (state: State) => state.config.kratosAuth.authTokenEndpoint;

export const getIsAuthPending = (state: State) => state.kratosAuth.isAuthPending;
export const getIsLoggedIn = (state: State) => state.kratosAuth.isLoggedIn;
export const getAuthError = (state: State) => state.kratosAuth.kratosAuthError;

const getUser = (state: State) => state.kratosAuth.user;

export const getUserEmail = createSelector(getUser, (user) => user?.identity.traits.email);
export const getUserRole = createSelector(getUser, (user) => user?.identity.traits.role);
