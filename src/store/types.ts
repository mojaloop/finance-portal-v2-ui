import { Dispatch as ReduxDispatch } from 'redux';
import { RouterState } from 'connected-react-router';
import { AuthState } from 'App/Auth/types';
import { FinancialPositionsState } from 'App/FinancialPositions/types';
import { SettlementWindowsState } from 'App/SettlementWindows/types';
import { SettlementsState } from 'App/Settlements/types';
import { DFSPsState } from 'App/DFSPs/types';

export interface State {
  router: RouterState;
  subApp: {
    auth: AuthState;
    dfsps: DFSPsState;
    financialPositions: FinancialPositionsState;
    settlementWindows: SettlementWindowsState;
    settlements: SettlementsState;
  };
}
export type PartialState = Partial<State>;

export type Dispatch = ReduxDispatch;
