import { calculateNetLiquidity, NetLiquidityParams, FullAccount, FspId } from '../../src/App/helpers';
import { Settlement, SettlementStatus } from '../../src/App/types';

interface MockData {
  unsettledSettlements: Settlement[];
  participantAccounts: Map<FspId, FullAccount[]>;
  expected: NetLiquidityParams[];
}

type TestCase = [string, MockData];

const testCases: TestCase[] = [
  [
    'should be calculated correctly for a single outstanding settlement',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PendingSettlement,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 100,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 500,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 900,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'should be calculated correctly for negative settlement amounts',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PendingSettlement,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -500,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 500,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 1500,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'should be calculated correctly for multiple outstanding settlements',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PendingSettlement,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 100,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 2,
          state: SettlementStatus.Settling,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.Settling,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 100,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.Settling,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 0,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 800,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'should correctly return recommended NDC when settlement amounts are zero',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PsTransfersReserved,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.PsTransfersReserved,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 0,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PsTransfersReserved,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 0,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 1000,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 1000,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'should correctly account for settlement accounts that are already settled',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.Settling,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.Settled,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 333,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PsTransfersReserved,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -333,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 1333,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 1000,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'should be calculated correctly for a more complex single-currency scenario',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PendingSettlement,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 250,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -750,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 26,
              accounts: [
                {
                  id: 47,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 1000,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 27,
              accounts: [
                {
                  id: 49,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 2,
          state: SettlementStatus.Settling,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 26,
              accounts: [
                {
                  id: 47,
                  state: SettlementStatus.Settling,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -400,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 24,
              accounts: [
                {
                  id: 43,
                  state: SettlementStatus.Settling,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 100,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 45,
                  state: SettlementStatus.Settling,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 300,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'testmmk4',
          [
            { id: 49, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 50, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 4000 },
          ],
        ],
        [
          'testmmk3',
          [
            { id: 47, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 48, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 20 },
          ],
        ],
        [
          'testmmk2',
          [
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
        [
          'testmmk1',
          [
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 1000 },
          ],
        ],
      ]),
      expected: [
        {
          amount: 4500,
          currency: 'MMK',
          name: 'testmmk4',
        },
        {
          amount: -580,
          currency: 'MMK',
          name: 'testmmk3',
        },
        {
          amount: 1450,
          currency: 'MMK',
          name: 'testmmk2',
        },
        {
          amount: 650,
          currency: 'MMK',
          name: 'testmmk1',
        },
      ],
    },
  ],
  [
    'Should be calculated correctly for multiple currency scenarios',
    {
      unsettledSettlements: [
        {
          id: 1,
          state: SettlementStatus.PendingSettlement,
          reason: 'Business Operations Portal request',
          createdDate: '2021-11-05T11:49:15.000Z',
          changedDate: '2021-11-05T14:26:43.000Z',
          participants: [
            {
              id: 24,
              accounts: [
                {
                  id: 41,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -332,
                    currency: 'EUR',
                  },
                },
                {
                  id: 43,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 500,
                    currency: 'MMK',
                  },
                },
              ],
            },
            {
              id: 25,
              accounts: [
                {
                  id: 47,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: 332,
                    currency: 'EUR',
                  },
                },
                {
                  id: 45,
                  state: SettlementStatus.PendingSettlement,
                  reason: 'Business Operations Portal request',
                  netSettlementAmount: {
                    amount: -500,
                    currency: 'MMK',
                  },
                },
              ],
            },
          ],
        },
      ],
      participantAccounts: new Map([
        [
          'test2',
          [
            { id: 47, currency: 'EUR', ledgerAccountType: 'POSITION', value: 10 },
            { id: 48, currency: 'EUR', ledgerAccountType: 'SETTLEMENT', value: 0 },
            { id: 45, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 46, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 9847 },
          ],
        ],
        [
          'test1',
          [
            { id: 41, currency: 'EUR', ledgerAccountType: 'POSITION', value: 10 },
            { id: 42, currency: 'EUR', ledgerAccountType: 'SETTLEMENT', value: 998 },
            { id: 43, currency: 'MMK', ledgerAccountType: 'POSITION', value: 10 },
            { id: 44, currency: 'MMK', ledgerAccountType: 'SETTLEMENT', value: 33312 },
          ],
        ],
      ]),
      expected: [
        {
          amount: -332,
          currency: 'EUR',
          name: 'test2',
        },
        {
          amount: 1330,
          currency: 'EUR',
          name: 'test1',
        },
        {
          amount: 10347,
          currency: 'MMK',
          name: 'test2',
        },
        {
          amount: 32812,
          currency: 'MMK',
          name: 'test1',
        },
      ],
    },
  ],
  // [
  //   'Should fail when accounts are not found for a participant',
  // ],
  // [
  //   'Should fail when participants are not found for an account',
  // ],
  // [
  //   'Should fail when settlement account is not found for a participant',
  // ],
];

describe('Net liquidity calculation', () => {
  test.each(testCases)('%s', (_desc, { unsettledSettlements, participantAccounts, expected }) => {
    const actual = calculateNetLiquidity(unsettledSettlements, participantAccounts);
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(expected).toEqual(expect.arrayContaining(actual));
  });
});
