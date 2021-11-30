import { Selector } from 'testcafe';
import { waitForReact } from 'testcafe-react-selectors';
import { SettlementsPage, SettlementFinalizeModal } from '../page-objects/pages/SettlementsPage';
import { LoginPage } from '../page-objects/pages/LoginPage';
import { config } from '../config';
import { SideMenu } from '../page-objects/components/SideMenu';
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import { settlement as settlementApi, reporting as reportingApi } from 'mojaloop-ts';
import ExcelJS from 'exceljs';

const { voodooEndpoint, reportBasePath, settlementsBasePath } = config;

fixture `Settlements Feature`
  .page`${config.financePortalEndpoint}`
  .before(async (ctx) => {
    const cli = new VoodooClient(voodooEndpoint, { defaultTimeout: config.voodooTimeoutMs });
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
  STORY: 'MMD-440',
  description:
    `Close two settlement windows. Add them to a settlement. Settle the settlement.`,
})('Settle settlement containing two closed windows', async (t) => {
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
  await settlementApi.closeSettlementWindow(
    settlementsBasePath,
    openWindows1[0].settlementWindowId,
    'Integration test',
  );

  // Run a transfer so the settlement window can be closed
  const transfers2: protocol.TransferMessage[] = [{
    msg_sender: participants[1].name,
    msg_recipient: participants[0].name,
    currency: 'MMK',
    amount: '10',
    transfer_id: uuidv4(),
  }];
  await cli.completeTransfers(transfers2);
  const openWindows2 = await cli.getSettlementWindows({ state: "OPEN" });
  await t.expect(openWindows2.length).eql(1, 'Expected only a single open window');
  await settlementApi.closeSettlementWindow(
    settlementsBasePath,
    openWindows2[0].settlementWindowId,
    'Integration test',
  );

  const settlementWindowIds = [
    openWindows1[0].settlementWindowId,
    openWindows2[0].settlementWindowId,
  ];

  const settlement = await settlementApi.createSettlement(
    settlementsBasePath,
    {
      reason: 'Integration test',
      settlementModel: 'DEFERREDNET',
      settlementWindows: settlementWindowIds.map((id) => ({ id })),
    },
  );

  // Get the initiation report, "simulate" some balances returned by the settlement bank, save it
  // as the finalization report.
  const initiationReport =
    await reportingApi.getSettlementInitiationReport(reportBasePath, settlement.id);
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(initiationReport.body);
  const ws = wb.getWorksheet(1);
  const BALANCE_COL = 'C';
  const PARTICIPANT_INFO_COL = 'A';
  const START_OF_DATA = 7;
  let endOfData = 7;
  while (ws.getCell(`A${endOfData}`).text !== '') {
    endOfData += 1;
  }
  const balanceInfo = ws.getRows(START_OF_DATA, endOfData - START_OF_DATA)?.map((row) => ({
    balance: Math.trunc(Math.random() * 5000),
    participantInfo: row.getCell(PARTICIPANT_INFO_COL),
    rowNum: row.number,
    row,
  }));
  await t.expect(balanceInfo).notEql(undefined, 'Expect some data rows in the settlement initiation report');
  balanceInfo?.forEach(({ balance, row }) => {
    row.getCell(BALANCE_COL).value = balance;
  });
  const filename = __dirname + `/settlement-finalization-report-settlement-${settlement.id}.xlsx`;
  // TODO: delete this; don't leave it lying round on the user's machine. Or, use a temp file. Or
  // don't? It's not difficult to delete files that aren't version-controlled, and being able to
  // examine the file afterward could be useful.
  wb.xlsx.writeFile(filename);

  await t.click(SideMenu.settlementsButton);

  const rowsBefore = await SettlementsPage.getResultRows();
  const settlementRowBefore = await Promise.any(rowsBefore.map(
    (r) => r.id.innerText.then(id => Number(id) === settlement.id ? Promise.resolve(r) : Promise.reject()),
  ));
  await t.expect(settlementRowBefore.state.innerText).eql('Pending Settlement');
  await t.click(settlementRowBefore.finalizeButton);

  await t.setFilesToUpload(SettlementFinalizeModal.fileInput, [filename]);
  await t.click(SettlementFinalizeModal.processButton);

  // This can take some time, use a high timeout
  await t.wait(30000);
  await t.click(Selector(SettlementFinalizeModal.closeButton, { timeout: 30000 }));
  await t.wait(30000);
  const rowsAfter = await SettlementsPage.getResultRows();
  const settlementRowAfter = await Promise.any(rowsAfter.map(
    (r) => r.id.innerText.then(id => Number(id) === settlement.id ? Promise.resolve(r) : Promise.reject()),
  ));

  const settlementAfter = await settlementApi.getSettlement(
    settlementsBasePath,
    settlement.id,
  );

  console.log(settlementAfter);

  await t.expect(settlementRowAfter.state.innerText).eql('Settled');

  // TODO: check financial positions
});


test.skip.meta({
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
