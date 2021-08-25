import React, { FC } from 'react';
import { Menu, MenuItem, MenuSection } from 'components';
import { useHistory, useLocation } from 'react-router-dom';

const SideMenu: FC<unknown> = () => {
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
      </Menu>
    </div>
  );
};

export default SideMenu;
