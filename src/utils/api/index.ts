import { put, select } from 'redux-saga/effects';
import axios from 'axios';
import {
  HeadersConfig,
  UrlConfig,
  ApiAction as LocalApiAction,
  BaseObject,
  ApiState as LocalApiState,
  ApiConfig,
  Endpoints,
  MethodName,
  Method,
  MethodMap,
} from './types';

const methodMaps: { [key in MethodName]: Method } = {
  read: 'get',
  create: 'post',
  update: 'put',
  delete: 'delete',
};

function getUrl<State>(baseUrl: UrlConfig<State>, state: State, data: BaseObject, urlFn?: UrlConfig<State>) {
  const appUrl = typeof baseUrl === 'function' ? baseUrl(state, data) : baseUrl;
  const endpointUrl = typeof urlFn === 'function' ? urlFn(state, data) : urlFn;
  return `${appUrl}${endpointUrl}`;
}

function getHeaders<State>(baseHeaders: HeadersConfig<State> = {}, state: State, data: BaseObject) {
  return typeof baseHeaders === 'function' ? baseHeaders(state, data) : baseHeaders;
}

function setRequestPending(endpoint: string, name: string): LocalApiAction {
  return {
    type: 'SET_API_REQUEST_PENDING',
    endpoint,
    name,
  };
}

function unsetRequestPending(endpoint: string, name: string): LocalApiAction {
  return {
    type: 'UNSET_API_REQUEST_PENDING',
    endpoint,
    name,
  };
}

function run<State>(endpointName: string, methodName: MethodName, config: ApiConfig<State>) {
  return function* dispatcher(data: BaseObject) {
    try {
      const state = yield select();

      const { url: rurl, transformResponse } = config;
      const method = methodMaps[methodName];
      const url = getUrl<State>(config.service.baseUrl, state, data, rurl);
      const headers = {
        'Content-Type': 'application/json',
        ...getHeaders(config.service.headers, state, data),
      };

      yield put(setRequestPending(endpointName, methodName));

      const response = yield axios({
        method,
        url,
        params: data.params,
        data: data.body,
        headers,
        withCredentials: true,
        validateStatus: () => true,
      });
      const transformedResponse = transformResponse ? transformResponse(response.data) : response.data;

      yield put(unsetRequestPending(endpointName, methodName));

      return { status: response.status, data: transformedResponse, headers: response.headers };
    } catch (e) {
      yield put(unsetRequestPending(endpointName, methodName));
      throw e;
    }
  };
}

interface ApiMethodMap {
  read?: object;
  create?: object;
  update?: object;
  delete?: object;
}

// eslint-disable-next-line
function buildApis<T, State>(
  endpoints: Endpoints<T>,
  // eslint-disable-next-line
): { [endpoint: string]: { [method: string]: any } } {
  return Object.entries(endpoints).reduce(
    (prev, [endpointName, config]) => ({
      ...prev,
      [endpointName]: Object.entries(methodMaps).reduce(
        (all: object, [methodName]: MethodMap): ApiMethodMap => ({
          ...all,
          [methodName]: run<State>(endpointName, methodName as MethodName, config),
        }),
        {},
      ),
    }),
    {},
  );
}

export function apiReducer(state: LocalApiState = {}, action: ApiAction) {
  const { type, endpoint, name } = action;
  switch (type) {
    case 'SET_API_REQUEST_PENDING':
      return {
        ...state,
        [endpoint]: {
          ...state[endpoint],
          [name]: true,
        },
      };
    case 'UNSET_API_REQUEST_PENDING':
      return {
        ...state,
        [endpoint]: {
          ...state[endpoint],
          [name]: false,
        },
      };
    default:
      return state;
  }
}

export function isPending(api: string): (apiState: LocalApiState) => boolean {
  const [endpoint, name] = api.split('.');
  return function isApiPending(apiState: LocalApiState): boolean {
    return apiState[endpoint] && apiState[endpoint][name] === true;
  };
}

export interface ApiState extends LocalApiState {}
export interface ApiAction extends LocalApiAction {}
export { buildApis };
