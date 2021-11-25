
import { deserializeReport } from '../../../src/App/Settlements/helpers';
import { readFile } from 'fs/promises';
import path from 'path';

test('simple_positive.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/simple_positive.xlsx'));
  const report = await deserializeReport(f);
  expect(report).toEqual({
    "settlementId": 13,
    "entries": [
      {
        "participant": {
          "id": 11,
          "name": "mmdokdollar"
        },
        "positionAccountId": 21,
        "balance": 1501000,
        "row": {
          "balance": 1501000,
          "rowNumber": 7,
          "switchIdentifiers": "11 21 mmdokdollar",
          "transferAmount": -1500,
        },
        "transferAmount": -1500
      },
      {
        "participant": {
          "id": 1,
          "name": "visionfund"
        },
        "positionAccountId": 19,
        "balance": 2200,
        "row": {
          "balance": 2200,
          "rowNumber": 8,
          "switchIdentifiers": "1 19 visionfund",
          "transferAmount": 1000,
        },
        "transferAmount": 1000
      },
      {
        "participant": {
          "id": 3,
          "name": "hana"
        },
        "row": {
          "balance": 2200,
          "rowNumber": 9,
          "switchIdentifiers": "3 25 hana",
          "transferAmount": 500,
        },
        "positionAccountId": 25,
        "balance": 2200,
        "transferAmount": 500
      }
    ],
  });
});

test('simple_positive_2.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/simple_positive_2.xlsx'));
  const report = await deserializeReport(f);

  expect(report).toEqual({
    "settlementId": 22,
    "entries": [
      {
        "participant": {
          "id": 1417,
          "name": "fsp3748",
        },
        "positionAccountId": 521,
        "balance": 8398905,
        "transferAmount": -136411,
        "row": {
          "rowNumber": 7,
          "switchIdentifiers": "1417 521 fsp3748",
          "balance": 8398905,
          "transferAmount": -136411
        },
      },
      {
        "participant": {
          "id": 182,
          "name": "fsp4833",
        },
        "positionAccountId": 1463,
        "balance": 6981333,
        "transferAmount": -92910,
        "row": {
          "rowNumber": 8,
          "switchIdentifiers": "182 1463 fsp4833",
          "balance": 6981333,
          "transferAmount": -92910
        },
      },
      {
        "participant": {
          "id": 3052,
          "name": "fsp4866",
        },
        "positionAccountId": 3016,
        "balance": 2498583,
        "transferAmount": 461888,
        "row": {
          "rowNumber": 9,
          "switchIdentifiers": "3052 3016 fsp4866",
          "balance": 2498583,
          "transferAmount": 461888
        },
      },
      {
        "participant": {
          "id": 2655,
          "name": "fsp3950",
        },
        "positionAccountId": 631,
        "balance": 3415533,
        "transferAmount": -322740,
        "row": {
          "rowNumber": 10,
          "switchIdentifiers": "2655 631 fsp3950",
          "balance": 3415533,
          "transferAmount": -322740
        },
      },
      {
        "participant": {
          "id": 4750,
          "name": "fsp188",
        },
        "positionAccountId": 4063,
        "balance": 3517620,
        "transferAmount": 205150,
        "row": {
          "rowNumber": 11,
          "switchIdentifiers": "4750 4063 fsp188",
          "balance": 3517620,
          "transferAmount": 205150
        },
      },
      {
        "participant": {
          "id": 1271,
          "name": "fsp1413",
        },
        "positionAccountId": 3646,
        "balance": 4906501,
        "transferAmount": 263231,
        "row": {
          "rowNumber": 12,
          "switchIdentifiers": "1271 3646 fsp1413",
          "balance": 4906501,
          "transferAmount": 263231
        },
      },
      {
        "participant": {
          "id": 3767,
          "name": "fsp451",
        },
        "positionAccountId": 660,
        "balance": 1075738,
        "transferAmount": -237125,
        "row": {
          "rowNumber": 13,
          "switchIdentifiers": "3767 660 fsp451",
          "balance": 1075738,
          "transferAmount": -237125
        },
      },
      {
        "participant": {
          "id": 2392,
          "name": "fsp1432",
        },
        "positionAccountId": 308,
        "balance": 6006609,
        "transferAmount": -216809,
        "row": {
          "rowNumber": 14,
          "switchIdentifiers": "2392 308 fsp1432",
          "balance": 6006609,
          "transferAmount": -216809
        },
      },
      {
        "participant": {
          "id": 611,
          "name": "fsp4867",
        },
        "positionAccountId": 1157,
        "balance": 5365762,
        "transferAmount": -40419,
        "row": {
          "rowNumber": 15,
          "switchIdentifiers": "611 1157 fsp4867",
          "balance": 5365762,
          "transferAmount": -40419
        },
      },
      {
        "participant": {
          "id": 2669,
          "name": "fsp3915",
        },
        "positionAccountId": 4320,
        "balance": 7152006,
        "transferAmount": 377483,
        "row": {
          "rowNumber": 16,
          "switchIdentifiers": "2669 4320 fsp3915",
          "balance": 7152006,
          "transferAmount": 377483
        },
      },
      {
        "participant": {
          "id": 1398,
          "name": "fsp2439",
        },
        "positionAccountId": 4213,
        "balance": 5469188,
        "transferAmount": -392160,
        "row": {
          "rowNumber": 17,
          "switchIdentifiers": "1398 4213 fsp2439",
          "balance": 5469188,
          "transferAmount": -392160
        },
      },
      {
        "participant": {
          "id": 1593,
          "name": "fsp1135",
        },
        "positionAccountId": 4858,
        "balance": 3794243,
        "transferAmount": -294242,
        "row": {
          "rowNumber": 18,
          "switchIdentifiers": "1593 4858 fsp1135",
          "balance": 3794243,
          "transferAmount": -294242
        },
      },
      {
        "participant": {
          "id": 3311,
          "name": "fsp292",
        },
        "positionAccountId": 3640,
        "balance": 1627966,
        "transferAmount": 367050,
        "row": {
          "rowNumber": 19,
          "switchIdentifiers": "3311 3640 fsp292",
          "balance": 1627966,
          "transferAmount": 367050
        },
      },
      {
        "participant": {
          "id": 1708,
          "name": "fsp3852",
        },
        "positionAccountId": 889,
        "balance": 3223778,
        "transferAmount": 360697,
        "row": {
          "rowNumber": 20,
          "switchIdentifiers": "1708 889 fsp3852",
          "balance": 3223778,
          "transferAmount": 360697
        },
      },
      {
        "participant": {
          "id": 549,
          "name": "fsp2499",
        },
        "positionAccountId": 683,
        "balance": 1019530,
        "transferAmount": -37979,
        "row": {
          "rowNumber": 21,
          "switchIdentifiers": "549 683 fsp2499",
          "balance": 1019530,
          "transferAmount": -37979
        },
      },
      {
        "participant": {
          "id": 917,
          "name": "fsp4341",
        },
        "positionAccountId": 1989,
        "balance": 2032587,
        "transferAmount": 109000,
        "row": {
          "rowNumber": 22,
          "switchIdentifiers": "917 1989 fsp4341",
          "balance": 2032587,
          "transferAmount": 109000
        },
      },
      {
        "participant": {
          "id": 976,
          "name": "fsp4095",
        },
        "positionAccountId": 1912,
        "balance": 6124080,
        "transferAmount": -492349,
        "row": {
          "rowNumber": 23,
          "switchIdentifiers": "976 1912 fsp4095",
          "balance": 6124080,
          "transferAmount": -492349
        },
      },
      {
        "participant": {
          "id": 2723,
          "name": "fsp2026",
        },
        "positionAccountId": 1426,
        "balance": 3167831,
        "transferAmount": 339714,
        "row": {
          "rowNumber": 24,
          "switchIdentifiers": "2723 1426 fsp2026",
          "balance": 3167831,
          "transferAmount": 339714
        },
      },
      {
        "participant": {
          "id": 3226,
          "name": "fsp3446"
        },
        "positionAccountId": 3590,
        "balance": 3375536,
        "transferAmount": -443104,
        "row": {
          "rowNumber": 25,
          "switchIdentifiers": "3226 3590 fsp3446",
          "balance": 3375536,
          "transferAmount": -443104
        },
      },
      {
        "participant": {
          "id": 4647,
          "name": "fsp3986",
        },
        "positionAccountId": 1688,
        "balance": 7581499,
        "transferAmount": 40997,
        "row": {
          "rowNumber": 26,
          "switchIdentifiers": "4647 1688 fsp3986",
          "balance": 7581499,
          "transferAmount": 40997
        },
      },
      {
        "participant": {
          "id": 4615,
          "name": "fsp3301",
        },
        "positionAccountId": 4812,
        "balance": 723064,
        "transferAmount": -353399,
        "row": {
          "rowNumber": 27,
          "switchIdentifiers": "4615 4812 fsp3301",
          "balance": 723064,
          "transferAmount": -353399
        },
      },
      {
        "participant": {
          "id": 3182,
          "name": "fsp4384",
        },
        "positionAccountId": 1713,
        "balance": 387785,
        "transferAmount": 37653,
        "row": {
          "rowNumber": 28,
          "switchIdentifiers": "3182 1713 fsp4384",
          "balance": 387785,
          "transferAmount": 37653
        },
      },
      {
        "participant": {
          "id": 3055,
          "name": "fsp3446",
        },
        "positionAccountId": 570,
        "balance": 4002874,
        "transferAmount": 160961,
        "row": {
          "rowNumber": 29,
          "switchIdentifiers": "3055 570 fsp3446",
          "balance": 4002874,
          "transferAmount": 160961
        },
      },
      {
        "participant": {
          "id": 650,
          "name": "fsp795",
        },
        "positionAccountId": 1482,
        "balance": 1016880,
        "transferAmount": 292990,
        "row": {
          "rowNumber": 30,
          "switchIdentifiers": "650 1482 fsp795",
          "balance": 1016880,
          "transferAmount": 292990
        },
      },
      {
        "participant": {
          "id": 3486,
          "name": "fsp2553",
        },
        "positionAccountId": 4417,
        "balance": 4021754,
        "transferAmount": -432234,
        "row": {
          "rowNumber": 31,
          "switchIdentifiers": "3486 4417 fsp2553",
          "balance": 4021754,
          "transferAmount": -432234
        },
      },
      {
        "participant": {
          "id": 36,
          "name": "fsp1176",
        },
        "positionAccountId": 841,
        "balance": 8832735,
        "transferAmount": 30895,
        "row": {
          "rowNumber": 32,
          "switchIdentifiers": "36 841 fsp1176",
          "balance": 8832735,
          "transferAmount": 30895
        },
      },
      {
        "participant": {
          "id": 1674,
          "name": "fsp1399",
        },
        "positionAccountId": 2916,
        "balance": 4548331,
        "transferAmount": 218504,
        "row": {
          "rowNumber": 33,
          "switchIdentifiers": "1674 2916 fsp1399",
          "balance": 4548331,
          "transferAmount": 218504
        },
      },
    ],
  });
});

test('settlement_id_wrong_cell.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/settlement_id_wrong_cell.xlsx'));
  await expect(deserializeReport(f)).rejects.toThrow(/Unable to extract settlement ID from cell B1/);
});

test('no_data.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/no_data.xlsx'));
  const report = await deserializeReport(f);
  expect(report).toEqual({
    "settlementId": 13,
    "entries": [],
  });
});

test('bad_mojaloop_identifier_column.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/bad_mojaloop_identifier_column.xlsx'));
  await expect(deserializeReport(f)).rejects.toThrow(/^Unable to extract participant ID, account ID and participant name from A9. Cell contents: \[3 hana 25\].*$/);
});

// TODO: we *could* check for a gap
test('missing_mojaloop_identifier.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/missing_mojaloop_identifier.xlsx'));
  const report = await deserializeReport(f);
  expect(report).toEqual({
    "settlementId": 13,
    "entries": [
      {
        "balance": 1501000,
        "participant": {
          "id": 11,
          "name": "mmdokdollar"
        },
        "positionAccountId": 21,
        "row": {
          "balance": 1501000,
          "rowNumber": 7,
          "switchIdentifiers": "11 21 mmdokdollar",
          "transferAmount": -1500,
        },
        "transferAmount": -1500,
      }
    ],
  });
});

test('missing_balance_entry.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/missing_balance_entry.xlsx'));
  await expect(deserializeReport(f)).rejects.toThrow(/^Unable to extract account balance from C9. Cell contents: \[\]$/);
});

test('missing_transfer_amount.xlsx', async () => {
  expect.assertions(1);
  const f = await readFile(path.join(__dirname, '/mock_data/missing_transfer_amount.xlsx'));
  await expect(deserializeReport(f)).rejects.toThrow(/^Unable to extract transfer amount from D8. Cell contents: \[\]$/);
});
