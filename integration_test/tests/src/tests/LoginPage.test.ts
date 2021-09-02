import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { Selector } from 'testcafe';
import { waitForReact } from 'testcafe-react-selectors';

fixture`Login Feature`
  .page`${config.financePortalEndpoint}`
  .beforeEach(async () => {
    await waitForReact();
  });

test.meta({
  ID: 'MMD-T11',
  STORY: 'MP-440',
})('Log in with valid credentials', async (t) => {
  await t
    .typeText(LoginPage.userName, config.credentials.admin.username)
    .typeText(LoginPage.password, config.credentials.admin.password)
    .click(LoginPage.submitButton);

  // Expect that the username dialog has disappeared, indicating login succeeded.
  await t.expect(LoginPage.userName.exists).notOk();
});

test.skip.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter wrong username and password, click the submit and login should fail', async (t) => {
  await t
    .typeText(LoginPage.userName, 'blah')
    .typeText(LoginPage.password, 'blah')
    .click(LoginPage.submitButton);

    const span = Selector('span').withText("Wrong Credentials").exists;

    await t.expect(span).ok;
});

// This test is skipped because it's known to fail. The fix is tracked here:
// https://modusbox.atlassian.net/browse/MMD-856
test.skip.meta({
  ID: 'MMD-T11',
  STORY: 'MP-440',
}).skip('Enter a valid username and an invalid password with spaces, login should fail', async (t) => {
  await t
    .typeText(LoginPage.userName, config.credentials.admin.username) 
    .typeText(LoginPage.password, `${config.credentials.admin.password} `) 
    .click(LoginPage.submitButton);

  // TODO: not this:
  // await t.expect(basePage.getNavBarLink()).notContains('Business Operations Portal');
});

test.skip.meta({
  ID: 'MMD-T16',
  STORY: 'MP-440',
})('Login button should be disabled when username and/or password fields are left blank', async (t) => {
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});


test.skip.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter a valid username and leave password blank, login button should be disabled', async (t) => {
  await t
    .typeText(LoginPage.userName, config.credentials.admin.username)
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});

test.skip.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter a valid password and leave username blank, login button should be disabled', async (t) => {
  await t
    .typeText(LoginPage.password, config.credentials.admin.password)
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});
