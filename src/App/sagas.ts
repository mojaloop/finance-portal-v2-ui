import { all } from 'redux-saga/effects';
import authSagas from './Auth/sagas';
import financialPositionsSagas from './FinancialPositions/sagas';
import settlementWindowsSagas from './SettlementWindows/sagas';
import settlementsSagas from './Settlements/sagas';
import DfspsSagas from './DFSPs/sagas';
import transfersSagas from './Transfers/sagas';

function* rootSaga(): Generator {
  yield all([
    authSagas(),
    DfspsSagas(),
    financialPositionsSagas(),
    settlementWindowsSagas(),
    settlementsSagas(),
    transfersSagas(),
  ]);
}

export default rootSaga;
