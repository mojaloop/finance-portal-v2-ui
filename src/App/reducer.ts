import { combineReducers } from 'redux';
import authReducer from './Auth/reducer';
import financialPositionsReducer from './FinancialPositions/reducer';
import settlementWindowsReducer from './SettlementWindows/reducer';
import settlementsReducer from './Settlements/reducer';
import dfspsReducer from './DFSPs/reducer';
import transfersReducer from './Transfers/reducer';

export default combineReducers({
  auth: authReducer,
  dfsps: dfspsReducer,
  financialPositions: financialPositionsReducer,
  settlementWindows: settlementWindowsReducer,
  settlements: settlementsReducer,
  transfers: transfersReducer,
});
