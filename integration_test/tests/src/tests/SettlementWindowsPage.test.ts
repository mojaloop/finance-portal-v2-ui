import { waitForReact } from 'testcafe-react-selectors';
import { SettlementWindowsPage, SettlementWindowStatus } from '../page-objects/pages/SettlementWindowsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import * as assert from 'assert';

const dateNotPresentRegex = /^-$|^$/;

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
    const cli = new VoodooClient('ws://localhost:3030/voodoo', { defaultTimeout: 15000 });
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
    // TODO: set things up so there's exactly one open window containing no transfers
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
    scenario: `Selecting Settlement Windows tab in Side Menu, the main settlement page should be
                  displayed with Date drop-down defaulted to Today, From and To drop-down defaulted
                  to current date in MM/DD/YYYY HH:MM:SS format, State should be empty and Clear
                  Filters button`
  })('Settlementwindow filter defaults as expected', async (t) => {

    // Call Mojaloop Settlement API to get the current window details

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
  await t.expect(resultRows[0].openDate.innerText).notMatch(dateNotPresentRegex);
  await t.expect(resultRows[0].closeDate.innerText).match(dateNotPresentRegex);
});

test.meta({
  ID: '',
  STORY: 'MMD-440',
  Scenario:
    `Close the single open settlement window, and expect the same window now shows up in a list of
     closed windows. Expect the closed windows in the list to display closed dates.`,
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
  await t.expect(closedRows[0].openDate.innerText).notMatch(dateNotPresentRegex);
  await t.expect(closedRows[0].closeDate.innerText).notMatch(dateNotPresentRegex);
});

test.meta({
  ID: '',
  STORY: 'MMD-440',
  description:
    `Close two settlement windows. Add them to a settlement. Check the settlement exists.`,
})('Create settlement from two closed windows', async (t) => {
  const { cli, participants } = t.fixtureCtx;
  // Run a transfer to ensure the settlement window can be closed
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
    id: openWindows1[0].settlementWindowId,
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
    id: openWindows2[0].settlementWindowId,
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
  const closedRowsById = Object.fromEntries(
    await Promise.all(closedRows.map(async (r) => [await r.id.innerText,  r])));
  await t.expect(
    settlementWindowIds.map((idNum) => String(idNum)).every((idStr) => idStr in closedRowsById)
  ).ok('Expected both our closed windows to be in the list of closed windows displayed in the UI');

  // Check our just-closed windows for closure
  await Promise.all(
    // Testcafe balks if we don't use async/await syntax here
    settlementWindowIds.map(async id => await t.click(closedRowsById[id].checkbox))
  );

  await t.click(SettlementWindowsPage.settleWindowsButton);
  const settlements = await cli.getSettlements({
    state: 'PENDING_SETTLEMENT',
    settlementWindowId: settlementWindowIds[0],
  });

  await t.expect(settlements.length).eql(1,
    'Expected our settlement windows to be in exactly one settlement');
  await t.expect(
    settlements[0].settlementWindows.map((sw: protocol.SettlementSettlementWindow) => sw.id).sort()
  ).eql(
    settlementWindowIds.sort(),
    `Expect settlement to contain the settlement windows we nominated and only those settlement
    windows`
  );
});

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440',
    scenario: `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in ISO8601 format
    State field should be empty and Clear Filters button should be present`
  })
  (`Default Windows landing page`, async t => {

  });

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440',
    scenario: `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with
    Date drop-down. The drop down should list values, Today, Past 48 Hours, 1 Week, 1 Month, Custom Range`
  })
  (`Drop down menu options for Date filter`, async t => {

  });

test
  .skip
  .meta({
    ID: '',
    STORY: 'MMD-440',
    scenario: `Once I click Settlement Windows tab in Side Menu, the page on the right should come up with
    State drop-down. The drop down should list values, Open, Closed, Pending, Settled, Aborted`
  })
  (`Drop down menu options for State filter`, async t => {

  });

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `On the default Settlement Windows page, if Today option for Date is selected and no other filters are active then all
      the windows that are available for current day should be displayed. This can be a combination of
      open, closed windows. If there are no windows that were transacted the current day, the current open
      window should be displayed.
      For each window that is displayed, Window ID, State, Open Date, Closed Date should be visible. `
    })(
      `Test Windows landing page with Today Date option selected`,
      async (t) => {

      },
    );

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `Once an open window is selected, there should be a button to close the window. Once the window
      is closed, the status of that window should change from Open to Closed and a new window should appear.`
    })(
    `Close Open Window`, async t => {

    });

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `If I try to close a window that does not have any transfers, it should give an
      error message: Unable to Close Window due to error 3100: "Generic validation error - Window 60 is empty"`
    })(
    `Unable to close window without any transfers`, async t => {

    });

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `Regardless of the filters that are chosen, clicking "Clear Filters" button should reset
      to default values Date - Today, From date with currrent date in YY/MM/DDDD 00:00:00 format and
      To date with currrent date in YY/MM/DDDD 23:59:59 format`
    })(
    `Clicking Clear Filters button to reset with default options`, async t => {

    });

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `On the Settlement Windows page, the settle windows button should be grayed out.
      If there is only one closed window, there should be a checkbox to the left of the window id.
      I should be able to click it, which will enable settle windows button at the top. I should be
      to click it and close the window.`
    })(
    `Settle closed windows individually`, async t => {

    });

  test.skip.meta({
      ID: '',
      STORY: 'MMD-440',
      scenario: `On the Settlement Windows page, the settle windows button should be grayed out.
      If there is a list of closed windows, there should be a checkbox to the left of the window ids.
      I should be able to select multiple closed windows, which will enable settle windows button at the top.
      I should be to click it and close the windows.`
    })(
    `Settle multiple closed windows simultaneously`, async t => {

    });
