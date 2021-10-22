import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Button, TextField } from 'components';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import './Login.css';
import { ReduxContext } from 'store';

const loginStateProps = (state: State) => ({
  username: selectors.getUsername(state),
  password: selectors.getPassword(state),
  loginError: selectors.getLoginError(state),
  isLoginPending: selectors.getIsLoginPending(state),
  isLoginFailed: selectors.getIsLoginFailed(state),
});

const loginDispatchProps = (dispatch: Dispatch) => ({
  onUsernameChange: (username: string) => dispatch(actions.setUsername(username)),
  onPasswordChange: (password: string) => dispatch(actions.setPassword(password)),
  onLoginSubmitClick: () => dispatch(actions.requestLogin()),
});

const loginConnector = connect(loginStateProps, loginDispatchProps, null, { context: ReduxContext });
type LoginConnectorProps = ConnectedProps<typeof loginConnector>;

const LoginImpl: FC<LoginConnectorProps> = ({
  username,
  password,
  onUsernameChange,
  onPasswordChange,
  onLoginSubmitClick,
  loginError,
  isLoginPending,
}) => {
  return (
    <div className="login__page">
      <div className="login__form">
        <TextField
          id="login__input-username"
          className="login__input"
          value={username}
          onChange={onUsernameChange}
          placeholder="Username"
        />
        <TextField
          id="login__input-password"
          className="login__input"
          value={password}
          onChange={onPasswordChange}
          placeholder="Password"
          type="password"
        />
        <Button
          id="login__btn-submit"
          className="login__submit"
          disabled={username === '' || password === ''}
          onClick={onLoginSubmitClick}
          label="Login"
          pending={isLoginPending}
        />
        {loginError && <span> {loginError} </span>}
      </div>
    </div>
  );
};

const Login = loginConnector(LoginImpl);
Login.displayName = 'Login';

export { Login };
