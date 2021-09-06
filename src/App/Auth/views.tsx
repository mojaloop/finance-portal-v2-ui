import React, { FC } from 'react';
import { connect } from 'react-redux';
import withMount from 'hocs';
import { State, Dispatch } from 'store/types';
import { Spinner } from 'components';
import * as actions from './actions';
import * as selectors from './selectors';
import { UserInfo } from './types';
import Login from './Login';

const stateProps = (state: State) => ({
  userInfo: selectors.getUserInfo(state),
  userInfoPending: selectors.getUserInfoPending(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestUserInfo()),
});

const connector = connect(stateProps, dispatchProps);

interface AuthRouterProps {
  userInfo?: UserInfo;
  onLogin: (payload: UserInfo) => void;
  userInfoPending: boolean;
}

const AuthRouter: FC<AuthRouterProps> = ({ children, userInfo, userInfoPending, onLogin }) => {
  if (userInfoPending) {
    return <Spinner center size={40} />;
  }

  if (userInfo === undefined) {
    return <Login />;
  }

  onLogin(userInfo);
  return <>{children}</>;
};

export default connector(withMount(AuthRouter, 'onMount'));
