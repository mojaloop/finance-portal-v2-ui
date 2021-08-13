const { Selector } = require('testcafe');
const loginPage = require('../page-objects/pages/LoginPage');
const BasePage = require('../page-objects/pages/BasePage');
const config = require('../../config');

fixture`Login Feature`.page`${config.financePortalEndpoint}`; // specify the start page

test.meta({
  ID: 'MMD-T11',
  STORY: 'MP-440',
})('Enter a valid username and password, click the submit and should be transferred to the main page', async (t) => {
  const basePage = new BasePage();
  await t
    .typeText(loginPage.userName, config.credentials.admin.username)
    .typeText(loginPage.password, config.credentials.admin.password)
    .click(loginPage.submitButton);

  await t.expect(basePage.getNavBarLink()).contains('Business Operations Portal');
});

test.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter wrong username and password, click the submit and login should fail', async (t) => {
  await t
    .typeText(loginPage.userName, 'blah')
    .typeText(loginPage.password, 'blah')
    .click(loginPage.submitButton);

    const span = Selector('span').withText("Wrong Credentials").exists;

    await t.expect(span).ok;
});

// This test is skipped because it's known to fail. The fix is tracked here:
// https://modusbox.atlassian.net/browse/MMD-856
test.meta({
  ID: 'MMD-T11',
  STORY: 'MP-440',
}).skip('Enter a valid username and an invalid password with spaces, login should fail', async (t) => {
  const basePage = new BasePage();
  await t
    .typeText(loginPage.userName, config.adminUsername) 
    .typeText(loginPage.password, `${config.adminPassword} `) 
    .click(loginPage.submitButton);

    await t.expect(basePage.getNavBarLink()).notContains('Business Operations Portal');
});

test.meta({
  ID: 'MMD-T16',
  STORY: 'MP-440',
})('Login button should be disabled when username and/or password fields are left blank', async (t) => {
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});


test.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter a valid username and leave password blank, login button should be disabled', async (t) => {
  await t
    .typeText(loginPage.userName, config.credentials.admin.username)
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});

test.meta({
  ID: 'MMD-T12',
  STORY: 'MP-440',
})('Enter a valid password and leave username blank, login button should be disabled', async (t) => {
  await t
    .typeText(loginPage.password, config.credentials.admin.password)
    const span = Selector(".login__submit").withAttribute("disabled").exists;
    await t.expect(span).ok;
});
