
import got, { OptionsOfJSONResponseBody } from 'got';
import { protocol } from 'mojaloop-voodoo-client';
import { URLSearchParams } from 'url';

export enum ResponseKind {
  MojaloopError,
  Okay,
}

type MLApiResponse<T> =
  | { kind: ResponseKind.MojaloopError; body: protocol.ErrorResponse }
  | { kind: ResponseKind.Okay; body: T };

interface SettlementsQueryBase {
  currency?: protocol.Currency;
  participantId?: protocol.ParticipantId;
  settlementWindowId?: protocol.SettlementWindowId;
  accountId?: protocol.ParticipantCurrencyId;
  state?: protocol.SettlementState;
  fromDateTime?: protocol.DateTime;
  toDateTime?: protocol.DateTime;
  fromSettlementWindowDateTime?: protocol.DateTime;
  toSettlementWindowDateTime?: protocol.DateTime;
}
interface SettlementsQueryCurrencyRequired extends SettlementsQueryBase { currency: protocol.Currency }
interface SettlementsQueryParticipantIdRequired extends SettlementsQueryBase { participantId: protocol.ParticipantId }
interface SettlementsQuerySettlementWindowIdRequired extends SettlementsQueryBase { settlementWindowId: protocol.SettlementWindowId }
interface SettlementsQueryAccountIdRequired extends SettlementsQueryBase { accountId: protocol.ParticipantCurrencyId }
interface SettlementsQueryStateRequired extends SettlementsQueryBase { state: protocol.SettlementState }
interface SettlementsQueryFromDateTimeRequired extends SettlementsQueryBase { fromDateTime: protocol.DateTime }
interface SettlementsQueryToDateTimeRequired extends SettlementsQueryBase { toDateTime: protocol.DateTime }
interface SettlementsQueryFromSettlementWindowDateTimeRequired extends SettlementsQueryBase { fromSettlementWindowDateTime: protocol.DateTime }
interface SettlementsQueryToSettlementWindowDateTimeRequired extends SettlementsQueryBase { toSettlementWindowDateTime: protocol.DateTime }

type GetSettlementsRequest =
  | SettlementsQueryCurrencyRequired
  | SettlementsQueryParticipantIdRequired
  | SettlementsQuerySettlementWindowIdRequired
  | SettlementsQueryAccountIdRequired
  | SettlementsQueryStateRequired
  | SettlementsQueryFromDateTimeRequired
  | SettlementsQueryToDateTimeRequired
  | SettlementsQueryFromSettlementWindowDateTimeRequired
  | SettlementsQueryToSettlementWindowDateTimeRequired;

export async function getSettlements(basePath: string, query: GetSettlementsRequest): Promise<MLApiResponse<protocol.Settlement[]>> {
  const opts: OptionsOfJSONResponseBody = {
    isStream: false,
    resolveBodyOnly: false,
    responseType: 'json',
    throwHttpErrors: false,
    searchParams: new URLSearchParams(Object.entries(query)),
  };
  const result = await got.get<protocol.Settlement[] | protocol.ErrorResponse>(`${basePath}/v2/settlements`, opts);
  if (result.statusCode >= 200 && result.statusCode < 300) {
    return {
      kind: ResponseKind.Okay,
      body: result.body as protocol.Settlement[],
    };
  }
  // Need to handle badly typed response from central settlement API
  // See: https://github.com/mojaloop/project/issues/2344
  if (result.statusCode === 400 && (result.body as protocol.ErrorResponse).errorInformation !== undefined) {
    return {
      kind: ResponseKind.Okay,
      body: [],
    };
  }
  return {
    kind: ResponseKind.MojaloopError,
    body: result.body as protocol.ErrorResponse,
  };
}

export default {
  getSettlements,
}
