import reporting from './reporting';
import settlement from './settlement';
import { protocol } from 'mojaloop-voodoo-client';

export enum ResponseKind {
  MojaloopError,
  Okay,
}

export type MLApiResponse<T> =
  | { kind: ResponseKind.MojaloopError; body: protocol.ErrorResponse }
  | { kind: ResponseKind.Okay; body: T };

export default {
  reporting,
  settlement,
  ResponseKind,
}
