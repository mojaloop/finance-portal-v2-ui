import { Selector } from 'testcafe';
import { waitForReact } from 'testcafe-react-selectors';
import { SettlementWindowsPage } from '../page-objects/pages/SettlementWindowsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../../config';
import { SideMenu } from '../page-objects/components/SideMenu';

fixture `Settlement windows page`
  // At the time of writing, it looks like this navigates to /windows. And it appears that this
  // isn't handled correctly, causing the root page (i.e. login) to load again.
  .page `${config.financePortalEndpoint}`
  .beforeEach(async (t) => {
    await waitForReact();
    await t
      .typeText(LoginPage.userName, config.credentials.admin.username)
      .typeText(LoginPage.password, config.credentials.admin.password)
      .click(LoginPage.submitButton)
      .click(SideMenu.settlementWindowsButton);
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
    console.log(SettlementWindowsPage);
    console.log(await Selector(SettlementWindowsPage.date).exists);
      await t
        .expect(Selector(SettlementWindowsPage.date).exists).ok()
        .expect(Selector(SettlementWindowsPage.toDate).exists).ok()
        .expect(Selector(SettlementWindowsPage.date).exists).ok()
        .expect(Selector(SettlementWindowsPage.state).exists).ok();
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
