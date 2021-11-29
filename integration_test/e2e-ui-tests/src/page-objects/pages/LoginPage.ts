import { ReactSelector } from 'testcafe-react-selectors';

const root = ReactSelector('Login');

export const LoginPage = {
  root,
  userName: root.findReact('TextField').withProps({ placeholder: 'Username' }),
  password: root.findReact('TextField').withProps({ placeholder: 'Password' }),
  submitButton: root.findReact('Button'),
};
