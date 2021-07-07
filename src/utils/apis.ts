import { State } from '../store/types';
import { buildApis } from './api';
import { ApiConfig } from './api/types';

// Note that prefixes are used to conceptually separate backend services even though they may
// be served by the same ingress/service.
const services = {
  loginService: {
    withCredentials: true,
    baseUrl: '/api/login',
  },
  settlementService: {
    withCredentials: true,
    baseUrl: '/api/settlement/v2',
  },
};

type Endpoint = ApiConfig<State>;

const login: Endpoint = {
  service: services.loginService,
  url: () => '/login',
};

const settlements: Endpoint = {
  service: services.settlementService,
  url: () => `/settlements`,
};

const settlementWindows: Endpoint = {
  service: services.settlementService,
  url: () => `/settlementWindows`,
};

const settlementWindow: Endpoint = {
  service: services.settlementService,
  url: (_: State, { settlementWindowId }: { settlementWindowId: string }) => `/settlementWindows/${settlementWindowId}`,
};

const settlement: Endpoint = {
  service: services.settlementService,
  url: (_: State, { settlementId }: { settlementId: string }) => `/settlements/${settlementId}`,
};

const settlementsDetailPositions: Endpoint = {
  service: services.settlementService,
  url: (_: State, { settlementId, detailId }: { settlementId: string; detailId: string }) =>
    `/settlements/${settlementId}/details/${detailId}/positions`,
};

const settleSettlementWindow: Endpoint = {
  service: services.settlementService,
  url: (_: State, { settlementWindowId }: { settlementWindowId: string }) =>
    `/settlement-window-commit/${settlementWindowId}`,
};

const closeSettlementWindow: Endpoint = {
  service: services.settlementService,
  // eslint-disable-next-line
  url: (_: State, { settlementWindowId }: any) => `/settlement-window-close/${settlementWindowId}`,
};

const dfsps: Endpoint = {
  service: services.settlementService,
  url: () => '/dfsps',
};

const previousWindow: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/previous-window/${dfspName}`,
};

const settlementAccount: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspId }: { dfspId: string }) => `/settlement-account/${dfspId}`,
};

const position: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspId }: { dfspId: string }) => `/positions/${dfspId}`,
};

const accounts: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/accounts/${dfspName}`,
};

const fundsOut: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspName, accountId }: { dfspName: string; accountId: string }) =>
    `/funds-out/${dfspName}/${accountId}`,
};

const fundsIn: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspName, accountId }: { dfspName: string; accountId: string }) =>
    `/funds-in/${dfspName}/${accountId}`,
};

const netdebitcap: Endpoint = {
  service: services.settlementService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/netdebitcap/${dfspName}`,
};

interface EndpointsMap {
  login: Endpoint;
  settlements: Endpoint;
  settlementWindows: Endpoint;
  settlementWindow: Endpoint;
  settlement: Endpoint;
  settlementsDetailPositions: Endpoint;
  settleSettlementWindow: Endpoint;
  closeSettlementWindow: Endpoint;
  dfsps: Endpoint;
  previousWindow: Endpoint;
  settlementAccount: Endpoint;
  position: Endpoint;
  accounts: Endpoint;
  fundsOut: Endpoint;
  fundsIn: Endpoint;
  netdebitcap: Endpoint;
}

const endpoints = {
  login,
  settlementWindows,
  settlementWindow,
  settlements,
  settlement,
  settlementsDetailPositions,
  settleSettlementWindow,
  closeSettlementWindow,
  dfsps,
  previousWindow,
  settlementAccount,
  position,
  accounts,
  fundsOut,
  fundsIn,
  netdebitcap,
};

export default buildApis<EndpointsMap, State>(endpoints);
