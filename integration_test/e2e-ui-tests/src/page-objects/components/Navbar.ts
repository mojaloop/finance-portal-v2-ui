import { ReactSelector } from 'testcafe-react-selectors';

const root = ReactSelector('Navbar');

export const Navbar = {
  root,
  navBarLink: root.findReact('a'),
  userIcon: root.findReact('Icon'),
  logoutButton: root.findReact('Button').withText('Log out'),
};
