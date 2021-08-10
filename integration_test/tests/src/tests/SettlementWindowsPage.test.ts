import { waitForReact } from 'testcafe-react-selectors';
import { SettlementWindowsPage, SettlementWindowStatus } from '../page-objects/pages/SettlementWindowsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';

fixture `Settlement windows page`
  // At the time of writing, it looks like this navigates to /windows. And it appears that this
  // isn't handled correctly, causing the root page (i.e. login) to load again.
  .page `${config.financePortalEndpoint}`
  .before(async (ctx) => {
    const currencies: protocol.Currency[] = ['MMK'];
    const accounts: protocol.AccountInitialization[] = [
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
    ];
    const cli = new VoodooClient('ws://localhost:3030/voodoo');
    await cli.connected();
    await cli.createHubAccounts(currencies);
    const participants = await cli.createParticipants(accounts);
    const transfers: protocol.TransferMessage[] = [{
      msg_sender: participants[0].name,
      msg_recipient: participants[1].name,
      currency: 'MMK',
      amount: '10',
      transfer_id: uuidv4(),
    }];
    await cli.completeTransfers(transfers);
    ctx.participants = participants;
  })
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
  })('Settlementwindow filter defaults as expected', async (t) => {

    // Call Mojaloop Settlement API to get the current window details
    console.log(t.fixtureCtx.participants);

    // Check that the latest window ID that displays on the page is the same
    await t
      .expect(SettlementWindowsPage.date.exists).ok()
      .expect(SettlementWindowsPage.toDate.exists).ok()
      .expect(SettlementWindowsPage.date.exists).ok()
      .expect(SettlementWindowsPage.state.exists).ok();
  });

test.meta({
  ID: '',
  STORY: 'MMD-440',
})('Expect a single open settlement window', async (t) => {
  // TODO: [multi-currency] we expect a single window per currency. Here we assume a single
  // currency, therefore a single window.
  await SettlementWindowsPage.selectFiltersCustomDateRange(t, {
    state: SettlementWindowStatus.Open,
  });
  // TODO: consider comparing this with the ML API result? Or, instead, use the UI to set up a
  // state that we expect, i.e. by closing all existing windows, then observing the single
  // remaining open window?
  await t.expect(SettlementWindowsPage.resultRows.count).eql(1);
});

test.meta({
  ID: '',
  STORY: 'MMD-440',
  description:
    `Close the single open settlement window, and expect the same window now shows up in a list of
     closed windows`,
})('Close settlement window', async (t) => {
  // TODO: [multi-currency] we expect a single window per currency. Here we assume a single
  // currency, therefore a single window.
  await SettlementWindowsPage.selectFiltersCustomDateRange(t, {
    state: SettlementWindowStatus.Open,
  });
  // await t.wait(10000);
  // TODO: consider comparing this with the ML API result? Or, instead, use the UI to set up a
  // state that we expect, i.e. by closing all existing windows, then observing the single
  // remaining open window?
  await t.expect(SettlementWindowsPage.resultRows.count).eql(1);
  const settlementWindowRow = SettlementWindowsPage.resultRows;
  const settlementWindowId = await settlementWindowRow.findReact('ItemCell').nth(1).innerText;
  const closeButton = settlementWindowRow.findReact('Button');
  const { props } = await closeButton.getReact();
  await t.expect(props.disabled).eql(false);
  await t.click(closeButton);

  await SettlementWindowsPage.selectFiltersCustomDateRange(t, {
    state: SettlementWindowStatus.Closed,
  });
  const closedRows = SettlementWindowsPage.resultRows;
  await t.expect(closedRows.count).gt(0);
  const length = await closedRows.count;
  await Promise.any(
    Array
      .from({ length })
      .map((_, i) => closedRows.nth(i).findReact('ItemCell').nth(1).innerText.then((id) => assert.equal(id, settlementWindowId)))
  ).catch(() => {
    throw new Error(`Couldn't find closed window with id ${settlementWindowId}`);
  });
});

test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to Past 48 hours.Check that From and To Date should be update
    to reflect 48 hours. Select state to open. All the corresponding windows should display based
    on the criteria selected`, async (t) => {

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
    on the criteria selected`, async (t) => {

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
    on the criteria selected`, async (t) => {

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
    on the criteria selected`, async (t) => {

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
    on the criteria selected`, async (t) => {

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
