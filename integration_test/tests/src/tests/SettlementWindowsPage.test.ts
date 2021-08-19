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
  const rows = await SettlementWindowsPage.getResultRows();
  await t.expect(rows.length).eql(1, 'Expected exactly one open settlement window');
  const { id, closeButton } = rows[0];
  const result = await id.innerText;
  await t.expect(closeButton.hasAttribute('disabled')).eql(false, 'Expected close button to be enabled');
  await t.click(closeButton);
  return result;
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
    ctx.cli = cli;
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
  const resultRows = await SettlementWindowsPage.getResultRows();
  await t.expect(resultRows.length).eql(1, 'Expected exactly one closed settlement window');
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
  const closedRows = await SettlementWindowsPage.getResultRows();
  await t.expect(closedRows.length).gt(0, 'Expected at least one closed settlement window');
  await Promise.any(
    closedRows.map((r) => r.id.innerText.then((id) => assert.equal(id, settlementWindowId)))
  ).catch(() => {
    throw new Error(`Couldn't find closed window with id ${settlementWindowId}`);
  });
});

test.meta({
  ID: '',
  STORY: 'MMD-440',
  description:
    `Close two settlement windows. Add them to a settlement. Check the settlement exists.`,
})('Create settlement from two closed windows', async (t) => {
  // TODO: consider comparing this with the ML API result? Or, instead, use the UI to set up a
  // state that we expect, i.e. by closing all existing windows, then observing the single
  // remaining open window?
  const { cli, participants } = t.fixtureCtx;
  // Run a transfer so the settlement window can be closed
  const transfers1: protocol.TransferMessage[] = [{
    msg_sender: participants[1].name,
    msg_recipient: participants[0].name,
    currency: 'MMK',
    amount: '10',
    transfer_id: uuidv4(),
  }];
  await cli.completeTransfers(transfers1);
  const openWindows1 = await cli.getSettlementWindows({ state: "OPEN" });
  await t.expect(openWindows1.length).eql(1, 'Expected only a single open window');
  const closedSettlementWindowId1 = await cli.closeSettlementWindow({
    id: openWindows1[0].id,
    reason: 'Integration test',
  });

  // Run a transfer so the settlement window can be closed
  const transfers2: protocol.TransferMessage[] = [{
    msg_sender: participants[0].name,
    msg_recipient: participants[1].name,
    currency: 'MMK',
    amount: '10',
    transfer_id: uuidv4(),
  }];
  await cli.completeTransfers(transfers2);
  const openWindows2 = await cli.getSettlementWindows({ state: "OPEN" });
  await t.expect(openWindows2.length).eql(1, 'Expected only a single open window');
  const closedSettlementWindowId2 = await cli.closeSettlementWindow({
    id: openWindows2[0].id,
    reason: 'Integration test',
  });

  const settlementWindowIds = [
    closedSettlementWindowId1,
    closedSettlementWindowId2,
  ];

  await SettlementWindowsPage.selectFiltersCustomDateRange(t, {
    state: SettlementWindowStatus.Closed,
  });
  const closedRows = await SettlementWindowsPage.getResultRows();
  await t.expect(closedRows.length).gt(1, 'Expected at least two closed settlement windows');
  const closedWindowIds = await Promise.all(closedRows.map((r) => r.id.innerText));
  assert.equal(
    closedWindowIds.filter((id) => settlementWindowIds.includes(id)).length,
    settlementWindowIds.length,
  );
});

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440',
})(
  `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
    Date drop-down. Select the Date to Past 48 hours.Check that From and To Date should be update
    to reflect 48 hours. Select state to open. All the corresponding windows should display based
    on the criteria selected`,
  async (t) => {

        //Call Mojaloop Settlement API to get the current window details

        // Check that the latest window ID that displays on the page is the same 
    });

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440'
  })
  (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
  Date drop-down. Select the Date to Past 1 week.Check that From and To Date should be update
  to reflect 48 hours. Select state to Closed. All the corresponding windows should display based
  on the criteria selected`,
  async (t) => {

      //Call Mojaloop Settlement API to get the current window details

      // Check that the latest window ID that displays on the page is the same 
  });

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440'
  })
  (`Once I click Settlement Windows tab in Side Menu, the page on the right should come up with 
  Date drop-down. Select the Date to Past 1 month.Check that From and To Date should be update
  to reflect 48 hours. Select state to Pending. All the corresponding windows should display based
  on the criteria selected`,
  async (t) => {

      //Call Mojaloop Settlement API to get the window details

      // Check that the latest window ID that displays on the page is the same 
  });

test
  .skip
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
  .skip
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
  });

test
  .skip
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
