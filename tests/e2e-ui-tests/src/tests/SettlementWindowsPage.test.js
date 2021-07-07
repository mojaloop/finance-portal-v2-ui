const { Role } = require('testcafe');
const settlementWindowsPage = require('../page-objects/pages/SettlementWindowsPage');
const userData = require('../data/user-data');
const loginPage = require('../page-objects/pages/LoginPage');

const regularUser = Role(`${userData.urls.FINANCE_PORTAL_V2.BASE_URL.QA}`, async (t) => {
    await t
            .typeText(await loginPage.getUserName(),'mfpadmin')
            .typeText(await loginPage.getPassword(),'mfpadmin')
            .click('#login');

});

fixture.skip `SettlementWindows Feature`
    .page `${userData.urls.FINANCE_PORTAL_V2.BASE_URL.QA}` // specify the start page  
    .beforeEach( async (t) => {
        t.useRole(regularUser);
    });

    test
    .meta({
        ID: '',
        STORY: 'MMD-440'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`, async t => {

        //Call Mojaloop Settlement API to get the current window details

        // Check that the latest window ID that displays on the page is the same
        await t
                .expect(settlementWindowsPage._date.exists).ok()
                .expect(settlementWindowsPage._fromDate.exists).ok()
                .expect(settlementWindowsPage._toDate.exists).ok()
                .expect(settlementWindowsPage._state.exists).ok();
    });

test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`,
  async (t) => {
    //Call Mojaloop Settlement API to get the current window details
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
