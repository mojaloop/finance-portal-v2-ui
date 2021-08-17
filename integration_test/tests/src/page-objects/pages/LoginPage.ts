import { ReactSelector } from 'testcafe-react-selectors';

export const LoginPage = {
  userName: ReactSelector('TextField').withProps({ placeholder: 'Username' }),
  password: ReactSelector('TextField').withProps({ placeholder: 'Password' }),
  submitButton: ReactSelector('Button'),
};
