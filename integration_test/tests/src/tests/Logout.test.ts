import { waitForReact } from 'testcafe-react-selectors';
import { Navbar } from '../page-objects/components/Navbar';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';

fixture `Logout`
  .page`${config.financePortalEndpoint}`
  .beforeEach(async (t) => {
    await waitForReact();
    await t
      .typeText(LoginPage.userName, config.credentials.admin.username)
      .typeText(LoginPage.password, config.credentials.admin.password)
      .click(LoginPage.submitButton);
  });

test.meta({
  ID: '',
  STORY: 'MMD-440',
  description: `Logout button returns the user to the login view`,
})('Logout', async (t) => {
  await t.click(Navbar.logoutButton);
  await t.expect(LoginPage.root.exists).ok();
  await t.expect(Navbar.root.exists).notOk();
});
