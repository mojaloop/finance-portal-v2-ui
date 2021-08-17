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
      STORY: 'MMD-440',
      Scenario: 'Default Windows landing page'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`, async t => {

        
    });

  test.meta({
      ID: '',
      STORY: 'MMD-440',
      Scenario: 'Test Windows landing page with Today Date option selected'
    })(
      `On the default Settlement Windows page, if Today option for Date is selected then all 
      the windows that are available for current day should be displayed. This can be a combination of
      open, closed windows. If there are no windows that were transacted the current day, the current open
      window should be displayed. 
      For each window that is displayed, Window ID, State, Open Date, Closed Date should be available. `,
      async (t) => {
        //Get the list of wondows for current date.
        // Check that the latest window ID that displays on the page is the same
      },
    );

  test.meta({
      ID: '',
      STORY: 'MMD-440',
      Scenario: 'Close Open Window'
    })(
    `Once an open window is selected, there should be a button to close the window. Once the window
    is closed, the status of that window should change from Open to Closed and a new window should appear.
      `, async t => {

          //Call Mojaloop Settlement API to get the current window details

          // Check that the latest window ID that displays on the page is the same 
    });

  test
    .meta({
      ID: '',
      STORY: 'MMD-440',
      Scenario: 'Settle Closed Window'
    })
    (``, async t => {

        
    });
