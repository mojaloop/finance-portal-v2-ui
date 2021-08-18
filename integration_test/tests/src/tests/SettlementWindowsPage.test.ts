import { waitForReact } from 'testcafe-react-selectors';
import { SettlementWindowsPage, SettlementWindowStatus } from '../page-objects/pages/SettlementWindowsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';
import { shim } from 'promise.any';

// At the time of writing, for some reason, in CI Promise.any is not working with
// > TypeError: Promise.any is not a function
shim();

const closeOpenSettlementWindow = async (t: TestController): Promise<string> => {
  // TODO: [multi-currency] we expect a single window per currency. Here we assume a single
  // currency, therefore a single window.
  await SettlementWindowsPage.selectFiltersCustomDateRange(t, {
    state: SettlementWindowStatus.Open,
  });
  await t.expect(SettlementWindowsPage.resultRows.count).eql(1);
  const settlementWindowRow = SettlementWindowsPage.resultRows;
  const settlementWindowId = await settlementWindowRow.findReact('ItemCell').nth(1).innerText;
  const closeButton = settlementWindowRow.findReact('Button');
  const { props } = await closeButton.getReact();
  await t.expect(props.disabled).eql(false);
  await t.click(closeButton);
  return settlementWindowId;
}

fixture `Settlement windows page`
  // At the time of writing, it looks like this navigates to /windows. And it appears that this
  // isn't handled correctly, causing the root page (i.e. login) to load again.
  .page `${config.financePortalEndpoint}`
  .before(async (ctx) => {
    const cli = new VoodooClient('ws://localhost:3030/voodoo');
    await cli.connected();

    const hubAccounts: protocol.HubAccount[] = [
      {
        type: "HUB_MULTILATERAL_SETTLEMENT",
        currency: "MMK",
      },
      {
        type: "HUB_RECONCILIATION",
        currency: "MMK",
      },
    ];
    await cli.createHubAccounts(hubAccounts);

    // const settlementModel: protocol.SettlementModel = {
    //   autoPositionReset: true,
    //   ledgerAccountType: "POSITION",
    //   settlementAccountType: "SETTLEMENT",
    //   name: "MMKMLNS",
    //   requireLiquidityCheck: true,
    //   settlementDelay: "DEFERRED",
    //   settlementGranularity: "NET",
    //   settlementInterchange: "MULTILATERAL",
    //   currency: "MMK",
    // };
    // await cli.createSettlementModel(settlementModel);

    const accounts: protocol.AccountInitialization[] = [
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
    ];
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

    // TODO: this test is a WIP

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
  // TODO: consider comparing this with the ML API result? Or, instead, use the UI to set up a
  // state that we expect, i.e. by closing all existing windows, then observing the single
  // remaining open window?
  const settlementWindowId = await closeOpenSettlementWindow(t);

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

test
    .meta({
      ID: '',
      STORY: 'MMD-440',
      Scenario: 'Default Windows landing page'
    })
    (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State field should be empty and Clear Filters button should be present`, async t => {

        
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
