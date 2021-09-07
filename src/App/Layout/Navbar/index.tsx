import React, { FC } from 'react';
import { Icon, Button } from 'components';

interface NavbarProps {
  username: string;
  onLogoutClick: () => void;
}

export const Navbar: FC<NavbarProps> = ({ username, onLogoutClick }) => (
  <div className="layout__navbar">
    <div className="layout__navbar__controls">
      <div className="layout__navbar__logo" />
      <a className="layout__navbar__home__link" href="/" role="button" aria-label="Home Button">
        Business Operations Portal
      </a>
    </div>
    <div className="layout__navbar__user">
      <div className="layout__navbar__user__icon">
        <Icon name="user-small" fill="#fff" />
      </div>
      <div className="layout__navbar__user__name" role="presentation">
        {username}
      </div>
      <div className="layout__navbar__logout__button">
        <Button kind="secondary" size="s" label="Log out" onClick={onLogoutClick} />
      </div>
    </div>
  </div>
);
