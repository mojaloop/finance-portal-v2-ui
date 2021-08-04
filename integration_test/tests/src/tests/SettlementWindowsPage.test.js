import { Selector, Role } from 'testcafe';

const settlementWindowsPage = require('../page-objects/pages/SettlementWindowsPage');
const loginPage = require('../page-objects/pages/LoginPage');
const config = require('../../config');

const adminUser = Role(config.financePortalEndpoint, async (t) => {
  await t
    .typeText(loginPage.userName, config.credentials.admin.username)
    .typeText(loginPage.password, config.credentials.admin.password)
    .click(loginPage.submitButton);
});

fixture `Settlement windows page`
  // At the time of writing, it looks like this navigates to /windows. And it appears that this
  // isn't handled correctly, causing the root page (i.e. login) to load again.
  // .page `${config.financePortalEndpoint}/windows`
  .beforeEach( async (t) => {
    await t
      .useRole(adminUser)
      .click(settlementWindowsPage.navBar.settlementWindowsButton);
  });

test
  .meta({
    ID: '',
    STORY: 'MMD-440',
    description: `Selecting Settlement Windows tab in Side Menu, the main settlement page should be
                  displayed with Date drop-down defaulted to Today, From and To drop-down defaulted
                  to current date in MM/DD/YYYY HH:MM:SS format, State should be empty and Clear
                  Filters button`
  })('Settlementwindow filter defaults as expected', async t => {

      // Call Mojaloop Settlement API to get the current window details

      // Check that the latest window ID that displays on the page is the same
    console.log(settlementWindowsPage);
    console.log(await Selector(settlementWindowsPage.date).exists);
      await t
        .expect(Selector(settlementWindowsPage.date).exists).ok()
        .expect(Selector(settlementWindowsPage.toDate).exists).ok()
        .expect(Selector(settlementWindowsPage.date).exists).ok()
        .expect(Selector(settlementWindowsPage.state).exists).ok();
    });

test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`,
  async (t) => {
    // Call Mojaloop Settlement API to get the current window details
    // Check that the latest window ID that displays on the page is the same
  },
);

test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to Past 48 hours.Check that From and To Date should be update
    to reflect 48 hours. Select state to open. All the corresponding windows should display based
    on the criteria selected`, async t => {

        //Call Mojaloop Settlement API to get the current window details

        // Check that the latest window ID that displays on the page is the same 
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to Past 1 week.Check that From and To Date should be update
    to reflect 48 hours. Select state to Closed. All the corresponding windows should display based
    on the criteria selected`, async t => {

        //Call Mojaloop Settlement API to get the current window details

        // Check that the latest window ID that displays on the page is the same 
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to Past 1 month.Check that From and To Date should be update
    to reflect 48 hours. Select state to Pending. All the corresponding windows should display based
    on the criteria selected`, async t => {

        //Call Mojaloop Settlement API to get the window details

        // Check that the latest window ID that displays on the page is the same 
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Dates to custom range. Check that From and To Date should be update
    to reflect 48 hours. Select state to Settled. All the corresponding windows should display based
    on the criteria selected`, async t => {

        //Call Mojaloop Settlement API to get the window details

        // Check that the latest window ID that displays on the page is the same 
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to custom range. Check that From and To Date should be update
    to reflect 48 hours. Select state to Aborted. All the corresponding windows should display based
    on the criteria selected`, async t => {

        //Call Mojaloop Settlement API to get the window details

        // Check that the latest window ID that displays on the page is the same 
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to custom range. Check that From and To Date should be update
    to reflect 48 hours. Select state to Aborted. All the corresponding windows should display based
    on the criteria selected`,
  async (t) => {
    //Call Mojaloop Settlement API to get the window details
    // Check that the latest window ID that displays on the page is the same
  },
);
