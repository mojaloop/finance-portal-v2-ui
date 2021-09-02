import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { State, Dispatch } from 'store/types';
import Layout from './Layout';
import Auth from './Auth';
import DFSPs from './DFSPs';
import SettlementWindows from './SettlementWindows';
import Settlements from './Settlements';
import FinancialPositions from './FinancialPositions';

import * as actions from './Auth/actions';
import * as selectors from './Auth/selectors';

const stateProps = (state: State) => ({
  username: selectors.getUsername(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onLogoutClick: () => dispatch(actions.requestLogout()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

const App: FC<ConnectorProps> = ({ username, onLogoutClick }) => (
  /* @ts-ignore */
  <Auth>
    {/* @ts-ignore */}
    <DFSPs>
      <Layout.Container>
        <Layout.Navbar username={username} onLogoutClick={onLogoutClick} />
        <Layout.Content>
          <Layout.SideMenu />
          <Layout.Page>
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
              <Route>
                <Redirect to="/windows" />
              </Route>
            </Switch>
          </Layout.Page>
        </Layout.Content>
      </Layout.Container>
    </DFSPs>
  </Auth>
);

const ConnectedApp = connector(App);

export { ConnectedApp as App };
export default ConnectedApp;
