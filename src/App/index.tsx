import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { State, Dispatch } from 'store/types';
import Loader from 'utils/loader';
import { Navbar, Page, SideMenu, Content, Container } from './Layout';
import Transfers from './Transfers';

import * as actions from './Auth/actions';
import * as selectors from './Auth/selectors';

const stateProps = (state: State) => ({
  // Auth should never succeed and fail to set userInfo
  username: selectors.getUserInfo(state)?.username as string,
});

const dispatchProps = (dispatch: Dispatch) => ({
  onLogoutClick: () => dispatch(actions.requestLogout()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

// TODO: kratos endpoints need to be passed to microfrontends
const auth = {
  loginEndpoint: '',
  logoutEndpoint: '',
  tokenEndpoint: '',
  isAuthEnabled: false,
};

let remoteUrl1: string;
let remoteUrl2: string;
if (process.env.NODE_ENV === 'production') {
  remoteUrl1 = window.portalEnv.REMOTE_1_URL;
  remoteUrl2 = window.portalEnv.REMOTE_2_URL;
} else {
  // Hardcoding these for now since more care about production
  remoteUrl1 = 'http://localhost:3012';
  remoteUrl2 = 'http://localhost:3013';
}

const App: FC<ConnectorProps> = ({ username, onLogoutClick }) => (
  <Container>
    <Navbar username={username} onLogoutClick={onLogoutClick} />
    <Content>
      <SideMenu />
      <Page>
        <Switch>
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
        </Switch>
      </Page>
    </Content>
  </Container>
);

const ConnectedApp = connector(App);

export { ConnectedApp as App };
export default ConnectedApp;
