import { strict as assert } from 'assert';
import { PayloadAction } from '@reduxjs/toolkit';
import { all, call, put, select, takeLatest, takeEvery } from 'redux-saga/effects';
import retry from 'async-retry';
import axios from 'axios';
import { getDfsps } from '../DFSPs/selectors';
import { DFSP } from '../DFSPs/types';
import { Currency } from '../types';
import apis, { services } from '../../utils/apis';
import {
  REQUEST_FINANCIAL_POSITIONS,
  SUBMIT_FINANCIAL_POSITION_UPDATE_MODAL,
  SUBMIT_FINANCIAL_POSITION_UPDATE_CONFIRM_MODAL,
  TOGGLE_CURRENCY_ACTIVE,
  Account,
  Limit,
  FinancialPosition,
  FinancialPositionsUpdateAction,
} from './types';
import {
  closeFinancialPositionUpdateModal,
  setFinancialPositions,
  setFinancialPositionsError,
  closeFinancialPositionUpdateConfirmModal,
  updateFinancialPositionNDCAfterConfirmModal,
} from './actions';
import {
  getFinancialPositions,
  getSelectedFinancialPosition,
  getFinancialPositionUpdateAmount,
  getSelectedFinancialPositionUpdateAction,
} from './selectors';

// Adding and withdrawing funds in the central ledger are not synchronous.
// So we poll the account endpoint a bit until there is a change before reloading the UI.
async function pollAccountFundsUpdate(oldAccountFunds: number, dfspName: string) {
  await retry(
    async () => {
      const accounts = await axios.get(`${services.ledgerService.baseUrl}/participants/${dfspName}/accounts`);
      if (accounts.status !== 200) {
        throw new Error('Account poll update failed - Request Failed');
      }

      const account = accounts.data.filter(
        (acc: { ledgerAccountType: string }) => acc.ledgerAccountType === 'SETTLEMENT',
      )[0];

      if (account.value !== oldAccountFunds) {
        // eslint-disable-next-line consistent-return
        return true;
      }
      throw new Error('Account poll update failed - Funds are the same');
    },
    {
      retries: 5,
    },
  );
}

function* fetchDFSPPositions(dfsp: DFSP) {
  const accounts = yield call(apis.participantAccounts.read, { participantName: dfsp.name });
  assert.equal(accounts.status, 200, `Failed to retrieve accounts for ${dfsp.name}`);
  const limits = yield call(apis.participantLimits.read, { participantName: dfsp.name });
  assert.equal(limits.status, 200, `Failed to retrieve limits for ${dfsp.name}`);

  const currencies = new Set<Currency>(accounts.data.map((a: Account) => a.currency));

  return [...currencies].map((c) => ({
    dfsp,
    currency: c,
    ndc: limits.data.find((l: Limit) => l.currency === c)?.limit.value,
    settlementAccount: accounts.data.find((a: Account) => a.currency === c && a.ledgerAccountType === 'SETTLEMENT'),
    positionAccount: accounts.data.find((a: Account) => a.currency === c && a.ledgerAccountType === 'POSITION'),
  }));
}

function* updateFinancialPositions(newPositions: FinancialPosition[]) {
  const currentPositions: FinancialPosition[] = yield select(getFinancialPositions);
  const updatedPositions = currentPositions.map(
    (oldPos) =>
      newPositions.find((newPos) => newPos.currency === oldPos.currency && newPos.dfsp.id === oldPos.dfsp.id) || oldPos,
  );
  yield put(setFinancialPositions(updatedPositions));
}

function* reloadFinancialPositionsParticipant(dfsp: DFSP) {
  const newDfspPositions = yield call(fetchDFSPPositions, dfsp);
  yield call(updateFinancialPositions, newDfspPositions);
}

function* fetchFinancialPositions() {
  try {
    const dfsps = (yield select(getDfsps)).filter((dfsp: DFSP) => dfsp.name !== 'Hub');
    const data = yield all(dfsps.map((dfsp: DFSP) => call(fetchDFSPPositions, dfsp)));
    yield put(setFinancialPositions(data.flat()));
  } catch (e) {
    yield put(setFinancialPositionsError(e.message));
  }
}

function* toggleCurrencyActive(action: PayloadAction<FinancialPosition>) {
  yield call(updateFinancialPositions, [
    {
      ...action.payload,
      positionAccount: {
        ...action.payload.positionAccount,
        updateInProgress: true,
      },
    },
  ]);
  const { positionAccount, dfsp } = action.payload;
  const newIsActive = !positionAccount.isActive;
  const description = newIsActive ? 'disable' : 'enable';
  const result = yield call(apis.participantAccount.update, {
    participantName: dfsp.name,
    accountId: positionAccount.id,
    body: {
      isActive: newIsActive,
    },
  });
  assert.equal(result.status, 200, `Failed to ${description} account ${positionAccount.id}`);
  yield call(reloadFinancialPositionsParticipant, dfsp);
}

function* updateFinancialPositionsParticipant() {
  const updateAmount = yield select(getFinancialPositionUpdateAmount);
  assert(updateAmount !== 0, 'Value 0 is not valid for Amount');

  const position: FinancialPosition = yield select(getSelectedFinancialPosition);
  const accounts = yield call(apis.accounts.read, { dfspName: position.dfsp.name });
  assert(accounts.status === 200, 'Unable to fetch DFSP data');

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

      yield call(pollAccountFundsUpdate, position.settlementAccount.value, position.dfsp.name);

      break;
    }
    case FinancialPositionsUpdateAction.WithdrawFunds: {
      const args = {
        body: { amount: updateAmount, currency: account.currency },
        dfspName: position.dfsp.name,
        accountId: account.id,
      };
      // The settlement account value will have a negative sign for a credit balance, and a
      // positive sign for a debit balance. The "updateAmount" is a withdrawal amount, and will
      // have a positive sign for a withdrawal. Therefore, if the sum of the two is greater than
      // zero, that would result in a debit balance, and we prevent it. It is also prevented in the
      // backend, but the backend processes a transfer through a sequence of states before
      // rejecting, making failure tricky to track. This will probably be required in future but in
      // the short term we simply reject the request here.
      assert(position.settlementAccount.value + Number(updateAmount) <= 0, 'Balance insufficient for this operation');
      const response = yield call(apis.fundsOut.create, args);

      assert(response.status === 200, 'Unable to update Financial Position Balance');

      yield call(pollAccountFundsUpdate, position.settlementAccount.value, position.dfsp.name);

      break;
    }
    default: {
      throw new Error('Action not expected on update Financial Position Balance');
    }
  }
  yield call(reloadFinancialPositionsParticipant, position.dfsp);
}

function* submitFinancialPositionsUpdateParticipant() {
  try {
    yield call(updateFinancialPositionsParticipant);
  } catch (e) {
    yield put(setFinancialPositionsError(e.message));
  } finally {
    yield put(updateFinancialPositionNDCAfterConfirmModal()); // set action on Update Participant modal to update NDC
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

export function* ToggleCurrencyActiveSaga(): Generator {
  yield takeEvery([TOGGLE_CURRENCY_ACTIVE], toggleCurrencyActive);
}

export default function* rootSaga(): Generator {
  yield all([
    FetchFinancialPositionsSaga(),
    SubmitFinancialPositionsUpdateParticipantSaga(),
    SubmitFinancialPositionsUpdateParticipantAndShowUpdateNDCSaga(),
    ToggleCurrencyActiveSaga(),
  ]);
}
