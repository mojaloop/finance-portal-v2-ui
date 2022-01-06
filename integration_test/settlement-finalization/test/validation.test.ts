import { validationFunctions, finalizeDataUtils, deserializeReport } from '../../../src/App/Settlements/helpers';
import { SettlementReport, Settlement as PortalSettlement } from '../../../src/App/Settlements/types';
import {
  reporting as reportingApi,
  ledger as ledgerApi,
  settlement as settlementApi,
} from 'mojaloop-ts'
import { VoodooClient, protocol } from 'mojaloop-voodoo-client';
import { v4 as uuidv4 } from 'uuid';
import ExcelJS from 'exceljs';
import { strict as assert } from 'assert';

const HOST = 'localhost';
const SWITCH_PORT = '8000';
const VOODOO_PORT = '3030';
const SETTLEMENT_ENDPOINT = `http://${HOST}:${SWITCH_PORT}/api/settlement`;
const REPORT_ENDPOINT = `http://${HOST}:${SWITCH_PORT}/report`
const LEDGER_ENDPOINT = `http://${HOST}:${SWITCH_PORT}/api/ledger`;
const VOODOO_ENDPOINT = `ws://${HOST}:${VOODOO_PORT}/voodoo`;

let cli: VoodooClient;
function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o))
}

beforeAll(async () => {
  cli = new VoodooClient(VOODOO_ENDPOINT, { defaultTimeout: 30000 })
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
})

afterAll(() => {
  cli.close();
});

describe('report validation against switch data', () => {
  test(
    'simple settlement containing two windows with one transfer in each, single currency - positive',
    async () => {
      expect.assertions(10);
      const accounts: protocol.AccountInitialization[] = [
        { currency: 'MMK', initial_position: '0', ndc: 10000 },
        { currency: 'MMK', initial_position: '0', ndc: 10000 },
      ];
      const participants = await cli.createParticipants(accounts);

      const transfers1: protocol.TransferMessage[] = [{
        msg_sender: participants[1].name,
        msg_recipient: participants[0].name,
        currency: 'MMK',
        amount: '10',
        transfer_id: uuidv4(),
      }];
      await cli.completeTransfers(transfers1);
      const openWindows1 = await settlementApi.getSettlementWindows(SETTLEMENT_ENDPOINT, { state: "OPEN" });
      await settlementApi.closeSettlementWindow(
        SETTLEMENT_ENDPOINT,
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
      const openWindows2 = await settlementApi.getSettlementWindows(SETTLEMENT_ENDPOINT, { state: "OPEN" });
      await settlementApi.closeSettlementWindow(
        SETTLEMENT_ENDPOINT,
        openWindows2[0].settlementWindowId,
        'Integration test',
      );

      const settlementWindowIds = [
        openWindows1[0].settlementWindowId,
        openWindows2[0].settlementWindowId,
      ];

      const settlement = await settlementApi.createSettlement(
        SETTLEMENT_ENDPOINT,
        {
          reason: 'Integration test',
          settlementModel: 'DEFERREDNET',
          settlementWindows: settlementWindowIds.map((id) => ({ id })),
        },
      );
      // We don't *care* at all what the total value is, it's for display purposes in the UI only.
      // We care only that this value can be used in the validation functionality. One day we'll
      // only use one set of types.
      const portalSettlement: PortalSettlement = { ...settlement, totalValue: 5 };

      // Get the initiation report, "simulate" some balances returned by the settlement bank, save it
      // as the finalization report.
      const initiationReport =
        await reportingApi.getSettlementInitiationReport(REPORT_ENDPOINT, settlement.id);
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
      balanceInfo?.forEach(({ balance, row }) => {
        row.getCell(BALANCE_COL).value = balance;
      });
      const reportBuffer = await wb.xlsx.writeBuffer();
      // Our participant[0] should have an expected balance of -20, our participant[1] should have
      // an expected balance of +20. So we'll modify their balances in the report to reflect this.
      const report: SettlementReport = await deserializeReport(reportBuffer).then((report) => ({
        ...report,
        entries: report.entries.map((entry) => ({
          ...entry,
          balance: {
            [participants[0].name]: -20,
            [participants[1].name]: 20,
          }[entry.participant.name] || entry.balance,
        }))
      }));

      const switchParticipants = await ledgerApi.getParticipants(LEDGER_ENDPOINT);

      const participantsLimits = finalizeDataUtils.transformParticipantsLimits(
        await ledgerApi.getParticipantsLimits(LEDGER_ENDPOINT),
      );
      const participantsAccounts = finalizeDataUtils.getParticipantsAccounts(switchParticipants);
      const accountsParticipants = finalizeDataUtils.getAccountsParticipants(switchParticipants);
      const settlementParticipantAccounts = finalizeDataUtils.getSettlementParticipantAccounts(settlement.participants);
      const settlementParticipants = finalizeDataUtils.getSettlementParticipants(settlement.participants);
      const accountsPositions = finalizeDataUtils.getAccountsPositions(
        (await Promise.all(
          report.entries.map(async ({ positionAccountId }) => {
            const participantName = accountsParticipants.get(positionAccountId)?.participant.name;
            assert(participantName, 'Require participantName to be defined');
            return await ledgerApi.getParticipantAccounts(LEDGER_ENDPOINT, participantName);
          }),
        )).flat()
      );

      const context = {
        participantsLimits,
        accountsParticipants,
        participantsAccounts,
        accountsPositions,
        settlementParticipantAccounts,
        settlementParticipants,
      };

      expect(validationFunctions.accountsValid(report, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.accountType(report, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.amounts(report, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.balancesAsExpected(report, context).size).toEqual(0);
      expect(validationFunctions.extraAccountsPresent(report, portalSettlement, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.reportIdentifiersCongruent(report, accountsParticipants, settlementParticipants).size).toEqual(0);
      expect(validationFunctions.unprocessedSettlementAccountsPresentInReport(report, portalSettlement, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.settlementId(report, portalSettlement).size).toEqual(0);
      expect(validationFunctions.transfersMatchNetSettlements(report, settlementParticipantAccounts).size).toEqual(0);
      expect(validationFunctions.transfersSum(report).size).toEqual(0);
    },
    60000,
  );

  test(
    'simple settlement containing two windows with one transfer in each, single currency - negative',
    async () => {
      expect.assertions(11);
      const accounts: protocol.AccountInitialization[] = [
        { currency: 'MMK', initial_position: '0', ndc: 10000 },
        { currency: 'MMK', initial_position: '0', ndc: 10000 },
      ];
      const participants = await cli.createParticipants(accounts);

      const transfers1: protocol.TransferMessage[] = [{
        msg_sender: participants[1].name,
        msg_recipient: participants[0].name,
        currency: 'MMK',
        amount: '10',
        transfer_id: uuidv4(),
      }];
      await cli.completeTransfers(transfers1);
      const openWindows1 = await settlementApi.getSettlementWindows(SETTLEMENT_ENDPOINT, { state: "OPEN" });
      await settlementApi.closeSettlementWindow(
        SETTLEMENT_ENDPOINT,
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
      const openWindows2 = await settlementApi.getSettlementWindows(SETTLEMENT_ENDPOINT, { state: "OPEN" });
      await settlementApi.closeSettlementWindow(
        SETTLEMENT_ENDPOINT,
        openWindows2[0].settlementWindowId,
        'Integration test',
      );

      const settlementWindowIds = [
        openWindows1[0].settlementWindowId,
        openWindows2[0].settlementWindowId,
      ];

      const settlement = await settlementApi.createSettlement(
        SETTLEMENT_ENDPOINT,
        {
          reason: 'Integration test',
          settlementModel: 'DEFERREDNET',
          settlementWindows: settlementWindowIds.map((id) => ({ id })),
        },
      );
      // We don't *care* at all what the total value is, it's for display purposes in the UI only.
      // We care only that this value can be used in the validation functionality. One day we'll
      // only use one set of types.
      const portalSettlement: PortalSettlement = { ...settlement, totalValue: 5 };

      // Get the initiation report, "simulate" some balances returned by the settlement bank, save it
      // as the finalization report.
      const initiationReport =
        await reportingApi.getSettlementInitiationReport(REPORT_ENDPOINT, settlement.id);
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
      balanceInfo?.forEach(({ balance, row }) => {
        row.getCell(BALANCE_COL).value = balance;
      });
      const reportBuffer = await wb.xlsx.writeBuffer();
      // Our participant[0] should have an expected balance of -20, our participant[1] should have
      // an expected balance of +20. So we'll modify their balances in the report to reflect this.
      // Remember: we're testing the negative case here.
      const report: SettlementReport = await deserializeReport(reportBuffer).then((report) => ({
        ...report,
        entries: report.entries.map((entry) => ({
          ...entry,
          balance: {
            [participants[0].name]: entry.balance - 20,
            [participants[1].name]: entry.balance + 20,
          }[entry.participant.name] || entry.balance,
        }))
      }));

      const switchParticipants = await ledgerApi.getParticipants(LEDGER_ENDPOINT);

      const participantsLimits = finalizeDataUtils.transformParticipantsLimits(
        await ledgerApi.getParticipantsLimits(LEDGER_ENDPOINT),
      );
      const participantsAccounts = finalizeDataUtils.getParticipantsAccounts(switchParticipants);
      const accountsParticipants = finalizeDataUtils.getAccountsParticipants(switchParticipants);
      const settlementParticipantAccounts = finalizeDataUtils.getSettlementParticipantAccounts(settlement.participants);
      const settlementParticipants = finalizeDataUtils.getSettlementParticipants(settlement.participants);
      const accountsPositions = finalizeDataUtils.getAccountsPositions(
        (await Promise.all(
          report.entries.map(async ({ positionAccountId }) => {
            const participantName = accountsParticipants.get(positionAccountId)?.participant.name;
            assert(participantName, 'Require participantName to be defined');
            return await ledgerApi.getParticipantAccounts(LEDGER_ENDPOINT, participantName);
          }),
        )).flat()
      );

      const context = {
        participantsLimits,
        accountsParticipants,
        participantsAccounts,
        accountsPositions,
        settlementParticipantAccounts,
        settlementParticipants,
      };

      let invalidAccountReport = clone(report);
      // Here we assume it's next-to-impossible that a position account ID will equal
      // Number.MAX_SAFE_INTEGER.
      invalidAccountReport.entries[0].positionAccountId = Number.MAX_SAFE_INTEGER;
      expect(validationFunctions.accountsValid(invalidAccountReport, accountsParticipants).size).toEqual(1);

      let invalidAccountTypeReport = clone(report);
      const settlementAccountId = accountsParticipants
        .get(invalidAccountTypeReport.entries[0].positionAccountId)?.participant.accounts
        .find((acc) => acc.ledgerAccountType === 'SETTLEMENT')?.id;
      expect(settlementAccountId).toBeDefined();
      invalidAccountTypeReport.entries[0].positionAccountId = settlementAccountId as number;
      expect(validationFunctions.accountType(invalidAccountTypeReport, accountsParticipants).size).toEqual(1);

      expect(validationFunctions.amounts(report, accountsParticipants).size).toEqual(0);

      // We modified the report balances earlier in order to fail this validation
      expect(validationFunctions.balancesAsExpected(report, context).size).toEqual(2);
      expect(validationFunctions.extraAccountsPresent(report, portalSettlement, accountsParticipants).size).toEqual(0);
      expect(validationFunctions.reportIdentifiersCongruent(report, accountsParticipants, settlementParticipants).size).toEqual(0);
      expect(validationFunctions.unprocessedSettlementAccountsPresentInReport(report, portalSettlement, accountsParticipants).size).toEqual(0);

      portalSettlement.id += 1;
      expect(validationFunctions.settlementId(report, portalSettlement).size).toEqual(1);

      expect(validationFunctions.transfersMatchNetSettlements(report, settlementParticipantAccounts).size).toEqual(0);
      expect(validationFunctions.transfersSum(report).size).toEqual(0);
    },
    60000,
  );
});
