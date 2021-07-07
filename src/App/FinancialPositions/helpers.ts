import { DFSP } from 'App/DFSPs/types';

export function isNotHUB(dfsp: DFSP): boolean {
  return dfsp.name !== 'Hub';
}

export function formatNumber(number: number | string) {
  return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatPerc(number: number) {
  return Math.floor(number * 100);
}
