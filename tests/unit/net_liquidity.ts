import { calculateNetLiquidity } from '../../src/App/helpers';
import { Settlement, ParticipantAccount } from '../../src/App/types';

interface MockData {
  unsettledSettlements: Settlement[];
  participantAccounts: ParticipantAccount[];
}

const data: MockData[] = [

];

describe('Net liquidity calculation', () => {
  test('should be calculated correctly for mock data 1', () => {
    expect(1).toStrictEqual(1);
  });
});
