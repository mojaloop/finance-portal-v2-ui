import got, { OptionsOfJSONResponseBody, Response } from 'got';
import { protocol } from 'mojaloop-voodoo-client';
import { URLSearchParams } from 'url';
import { Merge } from 'type-fest';

function serialize(body: any): string {
  return JSON.stringify(body);
}

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
export interface SettlementsQueryCurrencyRequired extends SettlementsQueryBase { currency: protocol.Currency }
export interface SettlementsQueryParticipantIdRequired extends SettlementsQueryBase { participantId: protocol.ParticipantId }
export interface SettlementsQuerySettlementWindowIdRequired extends SettlementsQueryBase { settlementWindowId: protocol.SettlementWindowId }
export interface SettlementsQueryAccountIdRequired extends SettlementsQueryBase { accountId: protocol.ParticipantCurrencyId }
export interface SettlementsQueryStateRequired extends SettlementsQueryBase { state: protocol.SettlementState }
export interface SettlementsQueryFromDateTimeRequired extends SettlementsQueryBase { fromDateTime: protocol.DateTime }
export interface SettlementsQueryToDateTimeRequired extends SettlementsQueryBase { toDateTime: protocol.DateTime }
export interface SettlementsQueryFromSettlementWindowDateTimeRequired extends SettlementsQueryBase { fromSettlementWindowDateTime: protocol.DateTime }
export interface SettlementsQueryToSettlementWindowDateTimeRequired extends SettlementsQueryBase { toSettlementWindowDateTime: protocol.DateTime }

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

export class ApiError extends Error {
  response: protocol.ErrorResponse;
  constructor(response: protocol.ErrorResponse) {
    super(response.errorInformation.errorDescription);
    this.response = response;
  }
}

const REQUEST_OPTS: OptionsOfJSONResponseBody = {
  isStream: false,
  resolveBodyOnly: false,
  responseType: 'json',
  throwHttpErrors: false,
  headers: {
    'content-type': 'application/json',
    'accept': 'application/json',
  },
};

export interface Options {
  throwMlError?: boolean;
}

type RequiredOptions = Required<Options>;

export const defaultOpts: OptionsOfThrowMlError = {
  throwMlError: true,
}

function handleOptions(opts: Options): RequiredOptions {
  return {
    throwMlError: opts.throwMlError === undefined ? true : opts.throwMlError,
  };
}

function handleResult<T>(result: Response<T | protocol.ErrorResponse>, throwMlError: boolean): T | MLApiResponse<T> {
  if (result.statusCode >= 200 && result.statusCode < 300) {
    if (throwMlError) {
      return result.body as T;
    }
    return {
      kind: ResponseKind.Okay,
      body: result.body as T,
    };
  }
  if (throwMlError) {
    throw new ApiError(result.body as protocol.ErrorResponse);
  }
  return {
    kind: ResponseKind.MojaloopError,
    body: result.body as protocol.ErrorResponse,
  };
}

export declare type OptionsOfThrowMlError = Merge<Options, {
  throwMlError?: true;
}>;

export async function getSettlements(
  basePath: string,
  query: GetSettlementsRequest,
  opts?: OptionsOfThrowMlError,
): Promise<protocol.Settlement[]>;

export async function getSettlements(
  basePath: string,
  query: GetSettlementsRequest,
  opts?: Options,
): Promise<MLApiResponse<protocol.Settlement[]>>;

export async function getSettlements(
  basePath: string,
  query: GetSettlementsRequest,
  opts: OptionsOfThrowMlError | Options = defaultOpts,
): Promise<protocol.Settlement[] | MLApiResponse<protocol.Settlement[]>> {
  const requestOpts: OptionsOfJSONResponseBody = {
    ...REQUEST_OPTS,
    searchParams: new URLSearchParams(Object.entries(query)),
  };
  const result = await got.get<protocol.Settlement[] | protocol.ErrorResponse>(
    `${basePath}/v2/settlements`,
    requestOpts,
  );
  if (result.statusCode >= 200 && result.statusCode < 300) {
    if (opts.throwMlError) {
      return result.body as protocol.Settlement[];
    }
    return {
      kind: ResponseKind.Okay,
      body: result.body as protocol.Settlement[],
    };
  }
  // Need to handle poorly-typed response from central settlement API.
  // See: https://github.com/mojaloop/project/issues/2344
  if (result.statusCode === 400 && (result.body as protocol.ErrorResponse).errorInformation !== undefined) {
    return (opts.throwMlError)
      ? [] as protocol.Settlement[]
      : {
          kind: ResponseKind.Okay,
          body: [],
        };
  }
  if (opts.throwMlError) {
    throw new ApiError(result.body as protocol.ErrorResponse);
  }
  return {
    kind: ResponseKind.MojaloopError,
    body: result.body as protocol.ErrorResponse,
  };
}

export async function closeSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  reason: string,
  opts?: OptionsOfThrowMlError,
): Promise<protocol.SettlementWindow>;

export async function closeSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  reason: string,
  opts?: Options,
): Promise<MLApiResponse<protocol.SettlementWindow>>;

// Returns the *new* settlement window, not the closed one
export async function closeSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  reason: string,
  opts: OptionsOfThrowMlError | Options = defaultOpts,
): Promise<protocol.SettlementWindow | MLApiResponse<protocol.SettlementWindow>> {
  const allOpts = handleOptions(opts);
  const requestOpts: OptionsOfJSONResponseBody = {
    ...REQUEST_OPTS,
    body: serialize({
      state: 'CLOSED',
      reason,
    }),
  };
  const apiResult = await got.post<protocol.SettlementWindow>(`${basePath}/v2/settlementWindows/${id}`, requestOpts);
  return handleResult<protocol.SettlementWindow>(apiResult, allOpts.throwMlError);
}

export interface CreateSettlementRequestBody {
  settlementModel: string;
  reason: string;
  settlementWindows: { id: protocol.SettlementWindowId }[];
}

export async function createSettlement(
  basePath: string,
  body: CreateSettlementRequestBody,
  opts?: OptionsOfThrowMlError,
): Promise<protocol.Settlement>;

export async function createSettlement(
  basePath: string,
  body: CreateSettlementRequestBody,
  opts?: Options,
): Promise<MLApiResponse<protocol.Settlement>>;

export async function createSettlement(
  basePath: string,
  body: CreateSettlementRequestBody,
  opts: OptionsOfThrowMlError | Options = defaultOpts,
): Promise<protocol.Settlement | MLApiResponse<protocol.Settlement>> {
  const allOpts = handleOptions(opts);
  const requestOpts: OptionsOfJSONResponseBody = {
    ...REQUEST_OPTS,
    body: serialize(body),
  };
  const result = await got.post<protocol.Settlement>(`${basePath}/v2/settlements`, requestOpts);
  return handleResult<protocol.Settlement>(result, allOpts.throwMlError);
}

interface SettlementWindowsQueryBase {
  currency?: protocol.Currency;
  participantId?: protocol.ParticipantId;
  state?: protocol.SettlementWindowState;
  fromDateTime?: protocol.DateTime;
  toDateTime?: protocol.DateTime;
}
export interface SettlementWindowsQueryCurrencyRequired extends SettlementWindowsQueryBase { currency: protocol.Currency }
export interface SettlementWindowsQueryParticipantIdRequired extends SettlementWindowsQueryBase { participantId: protocol.ParticipantId }
export interface SettlementWindowsQueryStateRequired extends SettlementWindowsQueryBase { state: protocol.SettlementWindowState }
export interface SettlementWindowsQueryFromDateTimeRequired extends SettlementWindowsQueryBase { fromDateTime: protocol.DateTime }
export interface SettlementWindowsQueryToDateTimeRequired extends SettlementWindowsQueryBase { toDateTime: protocol.DateTime }

export type GetSettlementWindowsRequest =
  | SettlementWindowsQueryCurrencyRequired
  | SettlementWindowsQueryParticipantIdRequired
  | SettlementWindowsQueryStateRequired
  | SettlementWindowsQueryFromDateTimeRequired
  | SettlementWindowsQueryToDateTimeRequired

export async function getSettlementWindows(
  basePath: string,
  query: GetSettlementWindowsRequest,
  opts?: OptionsOfThrowMlError,
): Promise<protocol.SettlementWindow[]>;

export async function getSettlementWindows(
  basePath: string,
  query: GetSettlementWindowsRequest,
  opts?: Options,
): Promise<MLApiResponse<protocol.SettlementWindow[]>>;

export async function getSettlementWindows(
  basePath: string,
  query: GetSettlementWindowsRequest,
  opts: OptionsOfThrowMlError | Options = defaultOpts,
): Promise<protocol.SettlementWindow[] | MLApiResponse<protocol.SettlementWindow[]>> {
  const requestOpts: OptionsOfJSONResponseBody = {
    ...REQUEST_OPTS,
    searchParams: new URLSearchParams(Object.entries(query)),
  };
  const result = await got.get<protocol.SettlementWindow[] | protocol.ErrorResponse>(
    `${basePath}/v2/settlementWindows`,
    requestOpts,
  );
  if (result.statusCode >= 200 && result.statusCode < 300) {
    if (opts.throwMlError) {
      return result.body as protocol.SettlementWindow[];
    }
    return {
      kind: ResponseKind.Okay,
      body: result.body as protocol.SettlementWindow[],
    };
  }
  // Need to handle poorly-typed response from central settlement API.
  // See: https://github.com/mojaloop/project/issues/2344
  if (result.statusCode === 400 && (result.body as protocol.ErrorResponse).errorInformation !== undefined) {
    return (opts.throwMlError)
      ? [] as protocol.SettlementWindow[]
      : {
          kind: ResponseKind.Okay,
          body: [],
        };
  }
  if (opts.throwMlError) {
    throw new ApiError(result.body as protocol.ErrorResponse);
  }
  return {
    kind: ResponseKind.MojaloopError,
    body: result.body as protocol.ErrorResponse,
  };
}

export async function getSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  opts?: OptionsOfThrowMlError,
): Promise<protocol.SettlementWindow[]>;

export async function getSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  opts?: Options,
): Promise<MLApiResponse<protocol.SettlementWindow[]>>;

export async function getSettlementWindow(
  basePath: string,
  id: protocol.SettlementWindowId,
  opts: OptionsOfThrowMlError | Options = defaultOpts,
): Promise<protocol.SettlementWindow[] | MLApiResponse<protocol.SettlementWindow[]>> {
  const allOpts = handleOptions(opts);
  const result = await got.get<protocol.SettlementWindow[] | protocol.ErrorResponse>(
    `${basePath}/v2/settlementWindows/${id}`,
    REQUEST_OPTS,
  );
  return handleResult<protocol.SettlementWindow[]>(result, allOpts.throwMlError);
}

export default {
  getSettlements,
  getSettlementWindows,
  getSettlementWindow,
  closeSettlementWindow,
  createSettlement,
}
