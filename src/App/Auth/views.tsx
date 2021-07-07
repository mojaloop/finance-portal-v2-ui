import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import withMount from 'hocs';
import { State, Dispatch } from 'store/types';
import { Spinner } from 'components';
import * as actions from './actions';
import * as selectors from './selectors';
import Login from './Login';

const stateProps = (state: State) => ({
  isTokenValid: selectors.getIsTokenValid(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.checkToken()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

interface AuthRouterProps {
  isTokenValid: boolean | null;
}

const AuthRouter: FC<AuthRouterProps> = ({ children, isTokenValid }) => {
  if (isTokenValid === null) {
    return <Spinner center size={40} />;
  }

  if (!isTokenValid) {
    return <Login />;
  }

  return <>{children}</>;
};

export default connector(withMount(AuthRouter, 'onMount'));
