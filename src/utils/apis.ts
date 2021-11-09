import { State } from '../store/types';
import { buildApis } from './api';
import { ApiConfig } from './api/types';

// Note that prefixes are used to conceptually separate backend services even though they may
// be served by the same ingress/service.
const services = {
  authService: {
    withCredentials: true,
    baseUrl: '/api/auth',
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
  transfersService: {
    withCredentials: true,
    baseUrl: '/api/portal-backend',
  },
  ledgerService: {
    withCredentials: true,
    baseUrl: '/api/ledger/',
  },
};

type Endpoint = ApiConfig<State>;

const logout: Endpoint = {
  service: services.authService,
  url: () => '/logout',
};

const login: Endpoint = {
  service: services.authService,
  url: () => '/login',
};

const transfers: Endpoint = {
  service: services.transfersService,
  url: (_: State, filters) => {
    // dont pass any undefined keys to URLSearchParams
    const sanitisedFilters = {
      ...filters,
    };

    Object.keys(sanitisedFilters).forEach((k) =>
      sanitisedFilters[k] === undefined ? delete sanitisedFilters[k] : null,
    );

    const queryString = new URLSearchParams(sanitisedFilters).toString();
    return `/transfers?${queryString}`;
  },
};

const transferDetails = {
  service: services.transfersService,
  url: (_: State, transferId: string) => `/transferDetails/${transferId}`,
};

const userInfo: Endpoint = {
  service: services.authService,
  url: () => '/userinfo',
};

const participants: Endpoint = {
  service: services.ledgerService,
  url: () => '/participants',
};

const participantsLimits: Endpoint = {
  service: services.ledgerService,
  url: () => `/participants/limits`,
};

const participantLimits: Endpoint = {
  service: services.ledgerService,
  url: (_, { participantName }) => `/participants/${participantName}/limits`,
};

const participantAccounts: Endpoint = {
  service: services.ledgerService,
  url: (_, { participantName }) => `/participants/${participantName}/accounts`,
};

const participantAccountTransfer: Endpoint = {
  service: services.ledgerService,
  url: (
    _: State,
    { participantName, accountId, transferId }: { participantName: string; accountId: string; transferId: string },
  ) => `/participants/${participantName}/accounts/${accountId}/transfers/${transferId}`,
};

const participantAccount: Endpoint = {
  service: services.ledgerService,
  url: (_: State, { participantName, accountId }: { participantName: string; accountId: string }) =>
    `/participants/${participantName}/accounts/${accountId}`,
};

const settlementParticipantAccount: Endpoint = {
  service: services.settlementService,
  url: (
    _: State,
    { settlementId, participantId, accountId }: { settlementId: string; participantId: string; accountId: string },
  ) => `/settlements/${settlementId}/participants/${participantId}/accounts/${accountId}`,
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
  accounts: Endpoint;
  closeSettlementWindow: Endpoint;
  dfsps: Endpoint;
  fundsIn: Endpoint;
  fundsOut: Endpoint;
  login: Endpoint;
  logout: Endpoint;
  netdebitcap: Endpoint;
  participantAccount: Endpoint;
  participantAccounts: Endpoint;
  participantAccountTransfer: Endpoint;
  participantLimits: Endpoint;
  participantsLimits: Endpoint;
  participants: Endpoint;
  settlement: Endpoint;
  settlementParticipantAccount: Endpoint;
  settlements: Endpoint;
  settlementWindow: Endpoint;
  settlementWindows: Endpoint;
  settleSettlementWindows: Endpoint;
  transfers: Endpoint;
  transferDetails: Endpoint;
  userInfo: Endpoint;
}

const endpoints = {
  accounts,
  closeSettlementWindow,
  dfsps,
  fundsIn,
  fundsOut,
  login,
  logout,
  netdebitcap,
  participantAccount,
  participantAccounts,
  participantAccountTransfer,
  participantLimits,
  participantsLimits,
  participants,
  settlement,
  settlementParticipantAccount,
  settlements,
  settlementWindow,
  settlementWindows,
  settleSettlementWindows,
  transfers,
  transferDetails,
  userInfo,
};

export default buildApis<EndpointsMap, State>(endpoints);
