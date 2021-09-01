import { waitForReact } from 'testcafe-react-selectors';
import { SettlementsPage } from '../page-objects/pages/SettlementsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import { shim } from 'promise.any';

// At the time of writing, for some reason, in CI Promise.any is not working with
// > TypeError: Promise.any is not a function
shim();

fixture `Settlements Feature`
  .page`${config.financePortalEndpoint}`
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
      .click(SideMenu.settlementsButton);
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


test.meta({
  ID: '',
  STORY: 'MMD-440',
})(
  `Once I click Settlement tab in Side Menu, the page on the right should come up with 
    Date drop-down defaulted to Today, From and To drop-down defaulted to current date in MM/DD/YYYY HH:MM:SS format
    State should be empty and Clear Filters button`,
  async (t) => {
    //Call Mojaloop Settlement API to get the current window details
    // Check that the latest window ID that displays on the page is the same
  },
);
