export type AppConfig = {
  basename: string;
};

export type ApiConfig = {
  authApiBaseUrl: string;
  authMockApi: boolean;
  remoteApiBaseUrl: string;
  remoteMockApi: boolean;
};

export interface AuthConfig {
  loginEndpoint: string;
  logoutEndpoint: string;
  authTokenEndpoint: string;
  isAuthEnabled: boolean;
}

export type ConfigState = {
  app: AppConfig;
  api: ApiConfig;
  auth: AuthConfig;
  isDevelopment: boolean;
};
