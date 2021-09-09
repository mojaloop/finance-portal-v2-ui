import { strict as assert } from 'assert';
import { all, call, put, select, takeLatest } from 'redux-saga/effects';
import { getDfsps } from 'App/DFSPs/selectors';
import { DFSP } from 'App/DFSPs/types';
import apis from '../../utils/apis';
import {
  REQUEST_FINANCIAL_POSITIONS,
  SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL,
  SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL,
  FinancialPosition,
  FinancialPositionsUpdateAction,
} from './types';
import {
  closeFinancialPositionUpdateModal,
  requestFinancialPositions,
  setFinancialPositions,
  setFinancialPositionsError,
  closeFinancialPositionUpdateConfirmModal,
  updateFinancialPositionNDCAfterConfirmModal,
} from './actions';
import * as helpers from './helpers';
import {
  getFinancialPositions,
  getSelectedFinancialPosition,
  getFinancialPositionUpdateAmount,
  getSelectedFinancialPositionUpdateAction,
} from './selectors';

function* fetchDFSPPositions(dfsp: DFSP) {
  const { name, id } = dfsp;

  const ndc = yield call(apis.netdebitcap.read, { dfspName: name });
  const account = yield call(apis.settlementAccount.read, { dfspId: id });
  const position = yield call(apis.position.read, { dfspId: id });

  if (ndc.status !== 200 || account.status !== 200 || position.status !== 200) {
    throw new Error('Unable to fetch data');
  }

  return {
    dfsp,
    balance: parseFloat(account.data[0].settlementBalance),
    limits: ndc.data[0].netDebitCap || 0,
    positions: parseFloat(position.data[0].position),
  };
}

function* fetchFinancialPositions() {
  try {
    const dfsps = yield select(getDfsps);
    if (!dfsps) {
      throw new Error('Unable to fetch data');
    }
    const data = yield all(dfsps.filter(helpers.isNotHUB).map((dfsp: DFSP) => call(fetchDFSPPositions, dfsp)));
    yield put(setFinancialPositions(data));
  } catch (e) {
    yield put(setFinancialPositionsError(e.message));
  }
}

function* updateFinancialPositionsParticipant() {
  const updateAmount = yield select(getFinancialPositionUpdateAmount);
  if (updateAmount === 0) {
    throw new Error('Value 0 is not valid for Amount.');
  }

  const position = yield select(getSelectedFinancialPosition);
  const accounts = yield call(apis.accounts.read, { dfspName: position.dfsp.name });
  if (accounts.status !== 200) {
    throw new Error('Unable to fetch DFSP data');
  }

  const account = accounts.data.filter(
    (acc: { ledgerAccountType: string }) => acc.ledgerAccountType === 'SETTLEMENT',
  )[0];

  const updateAction = yield select(getSelectedFinancialPositionUpdateAction);

  switch (updateAction) {
    case FinancialPositionsUpdateAction.ChangeNetDebitCap: {
      const response = yield call(apis.netdebitcap.create, {
        body: { newValue: updateAmount, currency: account.currency },
        dfspName: position.dfsp.name,
      });

      assert(response.status !== 401, 'Unable to update Net Debit Cap - user not authorized');
      assert(response.status === 200, 'Unable to update Net Debit Cap');

      break;
    }
    case FinancialPositionsUpdateAction.AddFunds: {
      const args = {
        body: { amount: updateAmount, currency: account.currency },
        dfspName: position.dfsp.name,
        accountId: account.id,
      };
      const response = yield call(apis.fundsIn.create, args);

      assert(response.status === 200, 'Unable to update Financial Position Balance');

      break;
    }
    case FinancialPositionsUpdateAction.WithdrawFunds: {
      const args = {
        body: { amount: updateAmount, currency: account.currency },
        dfspName: position.dfsp.name,
        accountId: account.id,
      };
      if (position.balance + updateAmount > 0) {
        throw new Error('Balance is not enough for this operation');
      }
      const response = yield call(apis.fundsOut.create, args);

      assert(response.status === 200, 'Unable to update Financial Position Balance');

      break;
    }
    default: {
      throw new Error('Action not expected on update Financial Position Balance');
    }
  }

  const allPositions: FinancialPosition[] = yield select(getFinancialPositions);
  const newPosition = yield call(fetchDFSPPositions, position.dfsp);
  const newPositions = allPositions.map((pos) => (pos.dfsp.id === position.dfsp.id ? newPosition : pos));
  yield put(setFinancialPositions(newPositions));
}

function* submitFinancialPositionsUpdateParticipant() {
  try {
    yield call(updateFinancialPositionsParticipant);
    yield put(requestFinancialPositions()); // load position to update the screen
  } catch (e) {
    yield put(setFinancialPositionsError(e.message));
  } finally {
    yield put(closeFinancialPositionUpdateModal());
  }
}

function* submitFinancialPositionsUpdateParticipantAndShowUpdateNDC() {
  try {
    yield call(updateFinancialPositionsParticipant);
  } catch (e) {
    yield put(setFinancialPositionsError(e.message));
  } finally {
    yield put(updateFinancialPositionNDCAfterConfirmModal()); // set action on Update Participant modal to update NDC
    yield put(closeFinancialPositionUpdateConfirmModal()); // back to Update Participant modal
  }
}

export function* FetchFinancialPositionsSaga(): Generator {
  yield takeLatest([REQUEST_FINANCIAL_POSITIONS], fetchFinancialPositions);
}

export function* SubmitFinancialPositionsUpdateParticipantSaga(): Generator {
  yield takeLatest([SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL], submitFinancialPositionsUpdateParticipant);
}

export function* SubmitFinancialPositionsUpdateParticipantAndShowUpdateNDCSaga(): Generator {
  yield takeLatest(
    [SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL],
    submitFinancialPositionsUpdateParticipantAndShowUpdateNDC,
  );
}

export default function* rootSaga(): Generator {
  yield all([
    FetchFinancialPositionsSaga(),
    SubmitFinancialPositionsUpdateParticipantSaga(),
    SubmitFinancialPositionsUpdateParticipantAndShowUpdateNDCSaga(),
  ]);
}
