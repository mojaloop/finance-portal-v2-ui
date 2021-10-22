import React, { FC } from 'react';
import { Menu, MenuItem, MenuSection } from 'components';
import { useHistory, useLocation } from 'react-router-dom';
import Loader from 'utils/loader';

const [remoteUrl1, remoteUrl2] =
  process.env.NODE_ENV === 'production'
    ? [window.portalEnv.REMOTE_1_URL, window.portalEnv.REMOTE_2_URL]
    : ['http://localhost:3012', 'http://localhost:3013'];

export const SideMenu: FC<unknown> = () => {
  const history = useHistory();
  const location = useLocation();

  return (
    <div className="layout__side-menu">
      <Menu path="/" pathname={location.pathname} onChange={history.push}>
        <MenuSection label="Settlement">
          <MenuItem path="/windows" label="Settlement Windows" partial />
          <MenuItem path="/settlements" label="Settlements" partial />
        </MenuSection>
        <MenuSection label="Participants">
          <MenuItem path="/positions" label="DFSP Financial Positions" partial />
        </MenuSection>
        <MenuSection label="Transfers">
          <MenuItem path="/transfers" label="Find Transfers" partial />
        </MenuSection>
        <MenuSection label="Microfrontends">
          <MenuItem key="/microiam" path="/microiam" label="Roles Microfrontend" partial>
            <Loader
              main={false}
              url={`${remoteUrl1}/app.js`}
              appName="reporting_hub_bop_role_ui"
              component="Menu"
              pathname={location.pathname}
              onChange={history.push}
              path="/microiam"
            />
          </MenuItem>
          <MenuItem key="/microtransfers" path="/microtransfers" label="Transfers Microfrontend" partial>
            <Loader
              main={false}
              url={`${remoteUrl2}/app.js`}
              appName="reporting_hub_bop_trx_ui"
              component="Menu"
              pathname={location.pathname}
              onChange={history.push}
              path="/microtransfers"
            />
          </MenuItem>
        </MenuSection>
      </Menu>
    </div>
  );
};
