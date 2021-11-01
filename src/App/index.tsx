import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { State, Dispatch } from 'store/types';
import Loader from 'utils/loader';
import ReduxContext from 'store/context';
import { Navbar, Page, SideMenu, Content, Container } from './Layout';
import { Auth } from './Auth';
import DFSPs from './DFSPs';
import SettlementWindows from './SettlementWindows';
import Settlements from './Settlements';
import FinancialPositions from './FinancialPositions';
import Transfers from './Transfers';
import { actions as authActions } from '../KratosAuth/slice';

import * as actions from './Auth/actions';
import * as selectors from './Auth/selectors';
import * as authSelectors from '../KratosAuth/selectors';

const stateProps = (state: State) => ({
  // Auth should never succeed and fail to set userInfo
  username: selectors.getUserInfo(state)?.username as string,
  isLoggedIn: authSelectors.getIsLoggedIn(state),
  userEmail: authSelectors.getUserEmail(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onLogoutClick: () => dispatch(actions.requestLogout()),
  kratosLogout: () => dispatch(authActions.logout()),
});

const connector = connect(stateProps, dispatchProps, null, { context: ReduxContext });
type ConnectorProps = ConnectedProps<typeof connector>;

// TODO: kratos endpoints need to be passed to microfrontends
const auth = {
  loginEndpoint: '',
  logoutEndpoint: '',
  tokenEndpoint: '',
  isAuthEnabled: false,
};

const [remoteUrl1, remoteUrl2] =
  process.env.NODE_ENV === 'production'
    ? [window.portalEnv.REMOTE_1_URL, window.portalEnv.REMOTE_2_URL]
    : [process.env.REMOTE_1_URL, process.env.REMOTE_2_URL];

const App: FC<ConnectorProps> = ({ username, onLogoutClick, kratosLogout }) => (
  /* @ts-ignore */
  <Auth>
    {/* @ts-ignore */}
    <DFSPs>
      <Container>
        <Navbar
          username={username}
          onLogoutClick={() => {
            onLogoutClick();
            kratosLogout();
          }}
        />
        <Content>
          <SideMenu />
          <Page>
            <Switch>
              <Route path="/windows">
                <SettlementWindows />
              </Route>
              <Route path="/settlements">
                <Settlements />
              </Route>
              <Route path="/positions">
                <FinancialPositions />
              </Route>
              <Route path="/transfers">
                <Transfers />
              </Route>
              <Route path="/microiam" key="/microiam">
                <Loader
                  main
                  url={`${remoteUrl1}/app.js`}
                  appName="reporting_hub_bop_role_ui"
                  component="App"
                  path="/microiam"
                  authConfig={auth}
                />
              </Route>
              <Route path="/microtransfers" key="/microtransfers">
                <Loader
                  main
                  url={`${remoteUrl2}/app.js`}
                  appName="reporting_hub_bop_trx_ui"
                  component="App"
                  path="/microtransfers"
                  authConfig={auth}
                />
              </Route>
              <Route>
                <Redirect to="/windows" />
              </Route>
            </Switch>
          </Page>
        </Content>
      </Container>
    </DFSPs>
  </Auth>
);

const ConnectedApp = connector(App);

export { ConnectedApp as App };
export default ConnectedApp;
