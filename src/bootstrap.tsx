import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import { ConnectedRouter } from 'connected-react-router';
import configureStore, { ReduxContext } from './store';
import getConfig from './Config';
import App from './App';
import { hocs as authHocs } from './KratosAuth';
import './index.css';

const AuthApp = authHocs.withAuth(App);

async function boot() {
  const config = await getConfig();
  const history = createBrowserHistory();
  const store = configureStore(
    { isDevelopment: process.env.NODE_ENV === 'development', history },
    {
      config: {
        app: {
          basename: config.basename,
        },
        api: {
          authApiBaseUrl: config.authApiBaseUrl,
          authMockApi: config.authMockApi,
          remoteApiBaseUrl: config.remoteApiBaseUrl,
          remoteMockApi: config.remoteMockApi,
        },
        kratosAuth: {
          loginEndpoint: config.loginEndpoint,
          logoutEndpoint: config.logoutEndpoint,
          authTokenEndpoint: config.authTokenEndpoint,
          isAuthEnabled: config.isAuthEnabled,
        },
      },
    },
  );
  const ConnectedApp = () => (
    <Provider store={store} context={ReduxContext}>
      <ConnectedRouter history={history} context={ReduxContext}>
        <AuthApp />
      </ConnectedRouter>
    </Provider>
  );

  ReactDOM.render(<ConnectedApp />, document.getElementById('root'));
}

boot();
