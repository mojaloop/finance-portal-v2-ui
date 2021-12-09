import {
  validationFunctions,
  extractReportQuantity,
} from '../../../src/App/Settlements/helpers';

import {
  AccountId,
  SettlementReport,
  Settlement,
  SettlementStatus,
  SettlementParticipantAccount,
  // SettlementFinalizeData,
  SettlementReportValidationKind,
} from '../../../src/App/Settlements/types';

describe('numeric value extraction', () => {
  const negativeTestCases = [
    ['1,23', NaN],
    ['1.2.34', NaN],
    ['1,23.33', NaN],
    ['1.2.99876', NaN],
    ['abc', NaN],
    ['', NaN],
    ['whatever', NaN],
    ['undefined', NaN],
    ['null', NaN],
    ['Null', NaN],
    ['Infinity', NaN],
    ['Inf', NaN],
    [(new Date()).toISOString(), NaN],
  ].flatMap(([input, result]) => ([
    [input, result],
    [`-${input}`, result],
    [`(${input})`, result],
  ]) as [string, number][]);
  test.each(negativeTestCases)(
    'extracts %s to %p',
    (input, expected) => {
      expect(extractReportQuantity(input)).toEqual(expected);
    },
  );

  // TODO:
  // We should also test numbers at, greater than, and less than various JS limits, e.g.
  // Number.MAX_*.
  const edgeCases: [string, number][] = [
    ['-0', -0],
    ['0', 0],
  ];
  test.each(edgeCases)(
    'extracts %s to %p',
    (input, expected) => {
      expect(extractReportQuantity(input)).toEqual(expected);
    },
  );

  // TODO: we should use a different distribution..
  // Probably sample ~100000 points in [0, max] in a linearly-translated, linearly-transformed
  // inverse log distribution, favouring points closer to zero. This way we should get a good range
  // of orders of magnitude, but favour numbers closer to where we expect them.
  test.concurrent.each(Array.from({ length: 20000 }).flatMap((_, i) => {
    const x = Math.random() * i * i;
    const xStr = x.toString();
    // Note that this is a convenience. We don't explicitly support this locale (or otherwise), but
    // using this locale is convenient for generating a string in the format we require.
    const xLStr = String(x).replace(/(?<!\..*)(\d)(?=(?:\d{3})+(?:\.|$))/g, '$1,')
    // const xLStr = x.toLocaleString('en-GB');
    return [
      [
        x,
        xStr,
      ],
      [
        x,
        xLStr,
      ],
      [
        -x,
        `(${xStr})`,
      ],
      [
        -x,
        `(${xLStr})`,
      ],
      [
        -x,
        `-${xStr}`,
      ],
      [
        -x,
        `-${xLStr}`,
      ],
    ];
  }) as [number, string][])(
    'extracts %p from %s',
    (expected, input) => {
      const result = extractReportQuantity(input);
      expect(result).toEqual(expected);
    },
  );
})

const unusedDate = (new Date()).toISOString();

// Need/want to update this? Easy way is to console.log(JSON.stringify(report, null, 2)) from one
// of the deserialisation unit tests.
interface TestData {
  report: SettlementReport;
  settlement: Settlement;
};
const testData: TestData[] = [
  {
    settlement: {
      changedDate: unusedDate,
      createdDate: unusedDate,
      id: 0xace,
      participants: [
        {
          id: 11,
          accounts: [
            {
              id: 21,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -1500,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1,
          accounts: [
            {
              id: 19,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 1000,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3,
          accounts: [
            {
              id: 25,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 500,
                currency: "MMK",
              },
            },
          ],
        },
      ],
      settlementWindows: null, // this isn't used in this code
      reason: 'test',
      state: SettlementStatus.PendingSettlement,
      totalValue: NaN, // unused in this code
    },
    report: {
      "settlementId": 0xace,
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
    },
  },
  {
    settlement: {
      changedDate: unusedDate,
      createdDate: unusedDate,
      id: 7357,
      participants: [
        {
          id: 1417,
          accounts: [
            {
              id: 521,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -136411,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 182,
          accounts: [
            {
              id: 1463,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -92910,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3052,
          accounts: [
            {
              id: 3016,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 461888,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 2655,
          accounts: [
            {
              id: 631,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -322740,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 4750,
          accounts: [
            {
              id: 4063,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 205150,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1271,
          accounts: [
            {
              id: 3646,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 263231,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3767,
          accounts: [
            {
              id: 660,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -237125,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 2392,
          accounts: [
            {
              id: 308,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -216809,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 611,
          accounts: [
            {
              id: 1157,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -40419,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 2669,
          accounts: [
            {
              id: 4320,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 377483,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1398,
          accounts: [
            {
              id: 4213,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -392160,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1593,
          accounts: [
            {
              id: 4858,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -294242,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3311,
          accounts: [
            {
              id: 3640,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 367050,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1708,
          accounts: [
            {
              id: 889,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 360697,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 549,
          accounts: [
            {
              id: 683,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -37979,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 917,
          accounts: [
            {
              id: 1989,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 109000,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 976,
          accounts: [
            {
              id: 1912,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -492349,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 2723,
          accounts: [
            {
              id: 1426,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 339714,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3226,
          accounts: [
            {
              id: 3590,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -443104,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 4647,
          accounts: [
            {
              id: 1688,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 40997,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 4615,
          accounts: [
            {
              id: 4812,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -353399,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3182,
          accounts: [
            {
              id: 1713,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 37653,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3055,
          accounts: [
            {
              id: 570,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 160961,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 650,
          accounts: [
            {
              id: 1482,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 292990,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 3486,
          accounts: [
            {
              id: 4417,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: -432234,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 36,
          accounts: [
            {
              id: 841,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 30895,
                currency: "MMK",
              },
            },
          ],
        },
        {
          id: 1674,
          accounts: [
            {
              id: 2916,
              state: SettlementStatus.PendingSettlement,
              reason: "test",
              netSettlementAmount: {
                amount: 218504,
                currency: "MMK",
              },
            },
          ],
        },
      ],
      settlementWindows: null, // this isn't used in this code
      reason: 'test',
      state: SettlementStatus.PendingSettlement,
      totalValue: NaN, // unused in this code
    },
    report: {
      "settlementId": 7357,
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
    },
  },
];

// const testSwitchData: SettlementFinalizeData[] = [
const testSwitchData = [
  {},
  {
    settlementParticipantAccounts: new Map<AccountId, SettlementParticipantAccount>(
      testData[1].report.entries.map((ent) => [
        ent.positionAccountId,
        {
          id: ent.positionAccountId,
          state: SettlementStatus.PendingSettlement,
          reason: 'test',
          netSettlementAmount: {
            amount: ent.transferAmount,
            currency: 'MMK',
          },
        },
      ])
    ),
  }
]

describe('Report data validation', () => {
  test('correct settlement id validated correctly', () => {
    const { settlement, report } = testData[0];
    const result = validationFunctions.settlementId(report, settlement);
    expect(result.size).toEqual(0);
  });

  test('incorrect settlement id validated correctly', () => {
    let { settlement } = testData[0];
    settlement.id += 5;
    const { report } = testData[0];
    const result = validationFunctions.settlementId(report, settlement);
    expect(result.size).toEqual(1);
    const item = result.values().next().value;
    expect(item.kind).toEqual(SettlementReportValidationKind.SettlementIdNonMatching);
  });

  test('transfers match net settlement amounts - positive', () => {
    const { report } = testData[1];
    const { settlementParticipantAccounts } = testSwitchData[1];
    const result = validationFunctions.transfersMatchNetSettlements(
      report,
      settlementParticipantAccounts,
    );
    expect(result.size).toEqual(0);
  });

  test('transfers match net settlement amounts - negative', () => {
    let { report } = testData[1];
    const { settlementParticipantAccounts } = testSwitchData[1];
    const testAccountId = report.entries[0].positionAccountId;
    let testAccount = settlementParticipantAccounts.get(testAccountId);
    testAccount.netSettlementAmount.amount += 100;
    const result = validationFunctions.transfersMatchNetSettlements(
      report,
      settlementParticipantAccounts,
    );
    expect(result.size).toEqual(1);
  });

  // test('balances as expected - positive', () => {});

  // TODO:
  // - test the union function
  // - test participants with multiple accounts
  // - multi-currency
  // - Write this as a huge range of integration tests, getting settlement initiation reports from
  //   the switch, then getting real switch data from the switch, and running the validation stuff
  //   against it?! Much less rubbish mocking. Few participants, few currencies, lot of transfers.
  //   Much higher value.
});
