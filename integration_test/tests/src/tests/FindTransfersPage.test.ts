import { waitForReact } from 'testcafe-react-selectors';
import { FindTransfersPage, TransferRow } from '../page-objects/pages/FindTransfersPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import { shim } from 'promise.any';

// At the time of writing, for some reason, in CI Promise.any is not working with
// > TypeError: Promise.any is not a function
shim();

fixture `Find Transfers Feature`
  .page`${config.financePortalEndpoint}`
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
    ctx.cli = cli;

    const accounts: protocol.AccountInitialization[] = [
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
    ];


    const participants = await cli.createParticipants(accounts);
    ctx.participants = participants;

    ctx.transfers = [];

    // Run two transfers
    const transfers1: protocol.TransferMessage[] = [{
      msg_sender: participants[1].name,
      msg_recipient: participants[0].name,
      currency: 'MMK',
      amount: '10',
      transfer_id: uuidv4(),
    }];
    ctx.transfers.push(transfers1[0]);
    await cli.completeTransfers(transfers1);

    const transfers2: protocol.TransferMessage[] = [{
      msg_sender: participants[0].name,
      msg_recipient: participants[1].name,
      currency: 'MMK',
      amount: '10',
      transfer_id: uuidv4(),
    }];
    ctx.transfers.push(transfers2[0]);
    await cli.completeTransfers(transfers2);
  })
  .beforeEach(async (t) => {
    await waitForReact();
    await t
      .typeText(LoginPage.userName, config.credentials.admin.username)
      .typeText(LoginPage.password, config.credentials.admin.password)
      .click(LoginPage.submitButton)
      .click(SideMenu.findTransfersButton); // yes, not the settlements button
  });

test.meta({
  ID: '',
  STORY: 'MMD-1430',
  description:
    `Find transfers with no filter selected should return transfers`,
})('Find transfers with no filter selected should return transfers', async (t) => {
  // navigate to the find transfers page
  await t.click(SideMenu.findTransfersButton);

  // click the find transfers button (no filters selected by default)
  await t.click(FindTransfersPage.findTransfersButton);

  // we should see two or more rows, one for each transfer we executed above
  const rows = await FindTransfersPage.getResultRows();
  await t.expect(rows.length).gt(1);

  // we should see the two transfers we just created
  const transferIds = t.fixtureCtx.transfers.map((t: protocol.TransferMessage) => t.transfer_id);
  const rowIds = await Promise.all(rows.map((r: TransferRow) => r.id.innerText));

  for(let i = 0; i < transferIds.length; i++) {
    await t.expect(rowIds).contains(transferIds[i], 'rows contains the transfer');
  }
});

test.meta({
  ID: '',
  STORY: 'MMD-1430',
  description:
    `Clicking on a transfer row should show a detail popup`,
})('Clicking on transfer row should show detail popup', async (t) => {
  // navigate to the find transfers page
  await t.click(SideMenu.findTransfersButton);

  // click the find transfers button (no filters selected by default)
  await t.click(FindTransfersPage.findTransfersButton);

  // get all rows found
  const rows = await FindTransfersPage.getResultRows();

  // click the first found row
  await t.click(rows[0].row);
  const transferId = await rows[0].id.innerText;

  const popup = FindTransfersPage.getTransferDetailsModal(transferId);

  await t.expect(popup.exists).ok('Transfer details popup not found in dom');
});
