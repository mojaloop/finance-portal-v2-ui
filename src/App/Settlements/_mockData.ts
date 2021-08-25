import { Settlement, SettlementDetail, SettlementDetailPosition } from './types';

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

function getDFSP(): string {
  const DFSPs = ['MPT Money', 'Aya Bank', 'Ooredoo', 'Vision Fund', 'CB Bank'];

  return DFSPs[Math.floor(Math.random() * DFSPs.length)];
}

const getDetailId = createIdGenerator(2500);

const getCreditDebit = createValueGenerator(100000, 500);

export const getSettlementDetails: (settlement: Settlement) => SettlementDetail[] = (settlement) => {
  return settlement.amounts.map((amount, index) => {
    const isDebit = amount < 0;
    return {
      id: getDetailId(),
      settlementId: settlement.id,
      dfspId: settlement.participants[index].id,
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
