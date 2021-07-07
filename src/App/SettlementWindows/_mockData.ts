import { SettlementWindow, SettlementWindowStatus } from './types';

const getId = (function createIdGenerator() {
  let id = 100;
  return function generateId() {
    // eslint-disable-next-line
    id = id + 1;
    return id.toString();
  };
})();

function timestamp(): string {
  return new Date().toISOString();
}

export const settlementWindows: SettlementWindow[] = [
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Open,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Pending,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Settled,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Aborted,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Closed,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Pending,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Pending,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Pending,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    settlementWindowId: getId(),
    state: SettlementWindowStatus.Pending,
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
];
