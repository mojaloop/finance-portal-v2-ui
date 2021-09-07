import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router-dom';
import { State, Dispatch } from 'store/types';
import { Navbar, Page, SideMenu, Content, Container } from './Layout';
import Auth from './Auth';
import DFSPs from './DFSPs';
import SettlementWindows from './SettlementWindows';
import Settlements from './Settlements';
import FinancialPositions from './FinancialPositions';

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

const App: FC<ConnectorProps> = ({ username, onLogoutClick }) => (
  /* @ts-ignore */
  <Auth>
    {/* @ts-ignore */}
    <DFSPs>
      <Container>
        <Navbar username={username} onLogoutClick={onLogoutClick} />
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
