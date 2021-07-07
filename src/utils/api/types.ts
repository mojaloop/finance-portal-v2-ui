type AnyPrimitive = string | number | boolean | undefined | null;

export interface ApiAction {
  type: string;
  endpoint: string;
  name: string;
}

export interface BaseObject {
  [key: string]: AnyPrimitive;
}

export interface ApiState {
  [endpoint: string]: {
    [name: string]: boolean;
  };
}

// eslint-disable-next-line
export type UrlResolver<State> = (state: State, data: any) => string;
export type UrlConfig<State> = UrlResolver<State> | string;

// eslint-disable-next-line
export type HeadersResolver<State> = (state: State, data: any) => Record<string, string>;
export type HeadersConfig<State> = HeadersResolver<State> | Record<string, string>;

interface Service<State> {
  baseUrl: UrlConfig<State>;
  headers?: HeadersConfig<State>;
  withCredentials?: boolean;
}

export interface ApiConfig<State> {
  service: Service<State>;
  url: UrlConfig<State>;
  transformResponse?: <S>(data: S) => AnyPrimitive;
}

export type Generic<T> = T;

export type Endpoints<T> = {
  // eslint-disable-next-line
  [K in keyof T]: T;
}[keyof T];

export type MethodName = 'read' | 'create' | 'update' | 'delete';
export type Method = 'get' | 'post' | 'put' | 'delete';
export type MethodMap = [string, Method];
