import { waitForReact } from 'testcafe-react-selectors';
import { SettlementsPage, SettlementFinalizeModal } from '../page-objects/pages/SettlementsPage';
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
  })
  .beforeEach(async (t) => {
    const accounts: protocol.AccountInitialization[] = [
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
      { currency: 'MMK', initial_position: '0', ndc: 10000 },
    ];
    const participants = await t.fixtureCtx.cli.createParticipants(accounts);

    t.fixtureCtx.participants = participants;

    await waitForReact();
    await t
      .typeText(LoginPage.userName, config.credentials.admin.username)
      .typeText(LoginPage.password, config.credentials.admin.password)
      .click(LoginPage.submitButton)
      .click(SideMenu.settlementWindowsButton); // yes, not the settlements button
  });

test.meta({
  ID: '',
  STORY: 'MMD-1430',
  description:
    `Find transfers with no filter selected`,
})('Find transfers with no filter selected', async (t) => {
  const { cli, participants } = t.fixtureCtx;
  // Run two transfers
  const transfers1: protocol.TransferMessage[] = [{
    msg_sender: participants[1].name,
    msg_recipient: participants[0].name,
    currency: 'MMK',
    amount: '10',
    transfer_id: uuidv4(),
  }];
  await cli.completeTransfers(transfers1);
  const transfers2: protocol.TransferMessage[] = [{
    msg_sender: participants[0].name,
    msg_recipient: participants[1].name,
    currency: 'MMK',
    amount: '10',
    transfer_id: uuidv4(),
  }];
  await cli.completeTransfers(transfers2);

  // navigate to the find transfers page
  await t.click(SideMenu.findTransfersButton);

  // click the find transfers button (no filters selected by default)
  await t.click(FindTransfersPage.findTransfersButton);

  // we should see two rows, one for each transfer we executed above
  const rowsBefore = await FindTransfersPage.getResultRows();
  await t.expect(rowsBefore.length).eql(2);
});


