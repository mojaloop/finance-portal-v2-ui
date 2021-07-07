import { Settlement, SettlementDetail, SettlementStatus, SettlementDetailPosition } from './types';

function createIdGenerator(id = 100) {
  return function generateId(): string {
    // eslint-disable-next-line
    id = id + 1;
    return id.toString();
  };
}

function createValueGenerator(amount: number, min: number) {
  return function generateValue(): number {
    return Math.ceil(Math.random() * amount + min);
  };
}

function timestamp(): string {
  return new Date().toISOString();
}

function getDFSP(): string {
  const DFSPs = ['MPT Money', 'Aya Bank', 'Ooredoo', 'Vision Fund', 'CB Bank'];

  return DFSPs[Math.floor(Math.random() * DFSPs.length)];
}

const getId = createIdGenerator(500);
const getWindowId = createIdGenerator(100);
const getDetailId = createIdGenerator(2500);

const getTotalValue = createValueGenerator(2000000, 125000);
const getTotalVolume = createValueGenerator(15000, 3000);
const getCreditDebit = createValueGenerator(100000, 500);

export const settlements: Settlement[] = [
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.Settled,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.Settling,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.Aborted,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.PendingSettlement,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.PsTransfersRecorded,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.PsTransfersReserved,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.PsTransfersCommitted,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.Settled,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
  {
    id: getId(),
    amounts: [-100, 100],
    participants: [12, 13],
    windowId: getWindowId(),
    state: SettlementStatus.Settled,
    totalValue: getTotalValue(),
    totalVolume: getTotalVolume(),
    createdDate: timestamp(),
    changedDate: timestamp(),
  },
];

export const getSettlementDetails: (settlement: Settlement) => SettlementDetail[] = (settlement) => {
  return settlement.amounts.map((amount, index) => {
    const isDebit = amount < 0;
    return {
      id: getDetailId(),
      settlementId: settlement.id,
      windowId: settlement.windowId,
      dfspId: settlement.participants[index],
      debit: isDebit ? amount : 0,
      credit: !isDebit ? amount : 0,
    };
  });
};

export const getSettlementDetailPositions: (settlementDetail: SettlementDetail) => SettlementDetailPosition[] = (
  settlementDetail,
) => {
  return new Array(50).fill(null).map(() => {
    const isDebit = Math.random() > 0.5;
    return {
      id: getDetailId(),
      detailId: settlementDetail.id,
      dfsp: getDFSP(),
      debit: isDebit ? getCreditDebit() : 0,
      credit: !isDebit ? getCreditDebit() : 0,
    };
  });
};
