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
  // HEY YOU.
  // Yes: you. Are you using the portal backend for your current work? Would it be easy enough to
  // instead use one of the core services? If so, you should do that. If you are writing new
  // functionality against the portal backend, stop, portal backend is deprecated and there is a
  // sinking lid policy on its usage- i.e. usage of the portal backend should monotonically
  // decrease. Not familiar with that terminology? It means: don't use the portal backend.
  portalBackendService: {
    withCredentials: true,
    baseUrl: '/api/portal-backend',
  },
  ledgerService: {
    withCredentials: true,
    baseUrl: '/api/ledger/',
  },
};

type Endpoint = ApiConfig<State>;

const login: Endpoint = {
  service: services.loginService,
  url: () => '/login',
};

const participants: Endpoint = {
  service: services.ledgerService,
  url: () => '/participants'
}

const participantAccountTransfer: Endpoint = {
  service: services.ledgerService,
  url: (_: State, { participantName, accountId, transferId }: { participantName: string, accountId: string, transferId: string }) =>
  `/participants/${participantName}/accounts/${accountId}/transfers/${transferId}`,
}

const participantAccount: Endpoint = {
  service: services.ledgerService,
  url: (_: State, { participantName, accountId }: { participantName: string, accountId: string }) =>
  `/participants/${participantName}/accounts/${accountId}`,
}

const settlementParticipantAccount: Endpoint = {
  service: services.settlementService,
  url: (_: State, { settlementId, participantId, accountId }: { settlementId: string, participantId: string, accountId: string }) =>
    `/settlements/${settlementId}/participants/${participantId}/accounts/${accountId}`,
}

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
  service: services.portalBackendService,
  url: (_: State, { settlementId, detailId }: { settlementId: string; detailId: string }) =>
    `/settlements/${settlementId}/details/${detailId}/positions`,
};

const settleSettlementWindows: Endpoint = {
  service: services.settlementService,
  url: () => `/settlements`,
};

const closeSettlementWindow: Endpoint = {
  service: services.settlementService,
  // eslint-disable-next-line
  url: (_: State, { settlementWindowId }: any) => `/settlementWindows/${settlementWindowId}`,
};

const dfsps: Endpoint = {
  service: services.portalBackendService,
  url: () => '/dfsps',
};

const previousWindow: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/previous-window/${dfspName}`,
};

const settlementAccount: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspId }: { dfspId: string }) => `/settlement-account/${dfspId}`,
};

const position: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspId }: { dfspId: string }) => `/positions/${dfspId}`,
};

const accounts: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/accounts/${dfspName}`,
};

const fundsOut: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspName, accountId }: { dfspName: string; accountId: string }) =>
    `/funds-out/${dfspName}/${accountId}`,
};

const fundsIn: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspName, accountId }: { dfspName: string; accountId: string }) =>
    `/funds-in/${dfspName}/${accountId}`,
};

const netdebitcap: Endpoint = {
  service: services.portalBackendService,
  url: (_: State, { dfspName }: { dfspName: string }) => `/netdebitcap/${dfspName}`,
};

interface EndpointsMap {
  login: Endpoint;
  settlements: Endpoint;
  settlementWindows: Endpoint;
  settlementWindow: Endpoint;
  settlement: Endpoint;
  participants: Endpoint;
  participantAccount: Endpoint;
  participantAccountTransfer: Endpoint;
  settlementParticipantAccount: Endpoint;
  settlementsDetailPositions: Endpoint;
  settleSettlementWindows: Endpoint;
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
  participants,
  participantAccount,
  participantAccountTransfer,
  settlementParticipantAccount,
  settlementsDetailPositions,
  settleSettlementWindows,
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
