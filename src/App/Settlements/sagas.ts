import { strict as assert } from 'assert';
import { v4 as uuidv4 } from 'uuid';
import { PayloadAction } from '@reduxjs/toolkit';
import apis from 'utils/apis';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import {
  REQUEST_SETTLEMENTS,
  SELECT_SETTLEMENT,
  SELECT_SETTLEMENT_DETAIL,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENTS_FILTER_STATE,
  SET_SETTLEMENTS_FILTER_VALUE,
  CLEAR_SETTLEMENTS_FILTERS,
  FINALIZE_SETTLEMENT,
  FinalizeSettlementErrorKind,
  Settlement,
  SettlementDetail,
  SettlementStatus,
  LedgerParticipant,
  LedgerAccount,
  SettlementParticipant,
  SettlementAccount,
} from './types';
import {
  setFinalizeSettlementError,
  setSettlements,
  setSettlementsError,
  setSettlementDetails,
  setSettlementDetailsError,
  setSettlementDetailPositions,
  setSettlementDetailPositionsError,
  requestSettlements,
} from './actions';
import { getSettlementsFilters } from './selectors';
import * as helpers from './helpers';
import { getSettlementDetails, getSettlementDetailPositions } from './_mockData';

class FinalizeSettlementError extends Error {
  info: {
    type: FinalizeSettlementErrorKind;
    data: any;
  };
  constructor(info: FinalizeSettlementError['info']) {
    super(info.type);
    this.info = info;
  }
}

function* finalizeSettlement(action: PayloadAction<Settlement>) {
  type SettlementAccountData = { participant: LedgerParticipant; transferId: string };
  try {
    switch (action.payload.state) {
      case SettlementStatus.PendingSettlement:
        yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(action.payload, SettlementStatus.PsTransfersRecorded),
        );
      // Note the deliberate fall-through behaviour here, representing the expected state transitions
      case SettlementStatus.PsTransfersRecorded:
        yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(action.payload, SettlementStatus.PsTransfersReserved),
        );
      // Note the deliberate fall-through behaviour here, representing the expected state transitions
      case SettlementStatus.PsTransfersReserved:
        yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(action.payload, SettlementStatus.PsTransfersCommitted),
        );
      // Note the deliberate fall-through behaviour here, representing the expected state transitions
      case SettlementStatus.PsTransfersCommitted:
        // Because participants returned from central settlement are database identifiers (i.e.
        // integer ids) but central ledger requires participant names, we request participants from
        // central ledger here and map account ids from central settlement to participant names. See
        // also https://github.com/mojaloop/mojaloop-specification/issues/91
        let participants: LedgerParticipant[] = yield call(apis.participants.read);
        const accountDataMap: Map<LedgerAccount['id'], SettlementAccountData> = new Map(
          participants.flatMap((p: LedgerParticipant) =>
            p.accounts.map(({ id }) => [
              id,
              {
                participant: p,
                transferId: uuidv4(),
              },
            ]),
          ),
        );

        const reason = `Business operations portal settlement id ${action.payload.id} settlement`;
        const accounts = action.payload.participants.flatMap((p: SettlementParticipant) => p.accounts);

        // This assert ensures the result of accountDataMap.get(acc.id) will not be undefined for
        // any of our accounts. It lets us safely use accountDataMap.get without checking the
        // result.
        assert(
          accounts.every((acc: SettlementAccount) => accountDataMap.has(acc.id)),
          'Expected every account id required in settlement to be returned by GET /participants',
        );

        // Payers settlement amount will be positive and payees will be negative
        const accsToDebit = accounts.filter((a: SettlementAccount) => a.netSettlementAmount.amount > 0);
        const accsToCredit = accounts.filter((a: SettlementAccount) => a.netSettlementAmount.amount < 0);

        // Deliberately sequence payers before payees
        const payerPrepareReserveResults: { status: number; body: any }[] = yield all(
          accsToDebit.map((acc: SettlementAccount) =>
            recordFundsOutPrepareReserve(
              acc,
              reason,
              <string>accountDataMap.get(acc.id)?.participant.name,
              <string>accountDataMap.get(acc.id)?.transferId,
            ),
          ),
        );
        const payerPrepareReserveErrors = payerPrepareReserveResults
          .filter(({ status }) => status !== 202)
          .map((result, i: number) => ({
            participant: accountDataMap.get(accsToDebit[i].id)?.participant,
            error: result.body.errorInformation,
          }));
        assert.strictEqual(
          payerPrepareReserveErrors.length,
          0,
          new FinalizeSettlementError({
            type: FinalizeSettlementErrorKind.RESERVE_PAYER_FUNDS_OUT,
            data: payerPrepareReserveErrors,
          }),
        );

        const payeeFundsInResults: { status: number; body: any }[] = yield all(
          accsToCredit.map((acc: SettlementAccount) =>
            recordFundsIn(
              acc,
              reason,
              <string>accountDataMap.get(acc.id)?.participant.name,
              <string>accountDataMap.get(acc.id)?.transferId,
            ),
          ),
        );
        const payeeFundsInErrors = payeeFundsInResults
          .filter(({ status }) => status !== 202)
          .map((result, i: number) => ({
            participant: accountDataMap.get(accsToDebit[i].id)?.participant,
            error: result.body.errorInformation,
          }));
        assert.strictEqual(
          payeeFundsInErrors.length,
          0,
          new FinalizeSettlementError({
            type: FinalizeSettlementErrorKind.PROCESS_PAYEE_FUNDS_IN,
            data: payeeFundsInErrors,
          }),
        );

        const payerCommitResults: { status: number; body: any }[] = yield all(
          accsToDebit.map((acc: SettlementAccount) =>
            recordFundsOutCommit(
              acc.id,
              reason,
              <string>accountDataMap.get(acc.id)?.participant.name,
              <string>accountDataMap.get(acc.id)?.transferId,
            ),
          ),
        );
        const payerCommitErrors = payerCommitResults
          .filter(({ status }) => status !== 202)
          .map((result, i: number) => ({
            ...accountDataMap.get(accsToDebit[i].id),
            error: result.body.errorInformation,
          }));
        assert.strictEqual(
          payerCommitErrors.length,
          0,
          new FinalizeSettlementError({
            type: FinalizeSettlementErrorKind.COMMIT_PAYER_FUNDS_OUT,
            data: payerCommitErrors,
          }),
        );

        break;
      case SettlementStatus.Settling:
        // participants = participants || yield call(apis.participants.read);
        break;
      case SettlementStatus.Settled:
        break;
      case SettlementStatus.Aborted:
        break;
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = action.payload.state;
        throw new Error(`Unhandled message type: ${exhaustiveCheck}`);
      }
    }
  } catch (err) {
    yield put(setFinalizeSettlementError(err));
  }

  function recordFundsOutCommit(accountId: number, reason: string, participantName: string, transferId: string) {
    return call(apis.participantAccountTransfer.update, {
      participantName,
      accountId,
      transferId,
      body: {
        action: 'recordFundsOutCommit',
        reason,
      },
    });
  }

  function recordFundsIn(acc: SettlementAccount, reason: string, participantName: string, transferId: string) {
    return call(apis.participantAccount.create, {
      participantName,
      accountId: acc.id,
      body: {
        transferId: transferId,
        externalReference: reason,
        action: 'recordFundsIn',
        reason,
        amount: {
          currency: acc.netSettlementAmount.currency,
          amount: acc.netSettlementAmount.amount,
        },
      },
    });
  }

  function recordFundsOutPrepareReserve(
    acc: SettlementAccount,
    reason: string,
    participantName: string,
    transferId: string,
  ) {
    return call(apis.participantAccount.create, {
      participantName,
      accountId: acc.id,
      body: {
        transferId,
        externalReference: reason,
        action: 'recordFundsOutPrepareReserve',
        reason,
        amount: {
          currency: acc.netSettlementAmount.currency,
          amount: -acc.netSettlementAmount.amount,
        },
      },
    });
  }

  function buildUpdateSettlementStateRequest(settlement: Readonly<Settlement>, state: SettlementStatus) {
    return {
      settlementId: settlement.id,
      body: {
        participants: settlement.participants.map((p) => ({
          ...p,
          accounts: p.accounts.map((a) => ({
            id: a.id,
            reason: 'Business operations portal request',
            state,
          })),
        })),
      },
    };
  }
}

export function* FinalizeSettlementSaga(): Generator {
  yield takeLatest(FINALIZE_SETTLEMENT, finalizeSettlement);
}

function* fetchSettlements() {
  try {
    const filters = yield select(getSettlementsFilters);
    const params = helpers.buildFiltersParams(filters);
    const response = yield call(apis.settlements.read, {
      params,
    });
    // Because when we call
    //   GET /v2/settlements?state=PS_TRANSFERS_RECORDED
    // and there are no settlements, central settlement returns
    //   400 Bad Request
    //   {
    //     "errorInformation": {
    //       "errorCode": "3100",
    //       "errorDescription": "Generic validation error - Settlements not found"
    //     }
    //   }
    // We translate this response to an empty array.
    // Source here:
    //   https://github.com/mojaloop/central-settlement/blob/45ecfe32d1039870aa9572e23747c24cd6d53c86/src/domain/settlement/index.js#L218
    if (
      response.status === 400 &&
      /Generic validation error.*not found/.test(response.data?.errorInformation?.errorDescription)
    ) {
      yield put(setSettlements([]));
    } else {
      yield put(setSettlements(response.data.map(helpers.mapApiToModel)));
    }
  } catch (e) {
    yield put(setSettlementsError(e.message));
  }
}

export function* FetchSettlementsSaga(): Generator {
  yield takeLatest(REQUEST_SETTLEMENTS, fetchSettlements);
}

function* fetchSettlementAfterFiltersChange(action: PayloadAction) {
  if (action.payload !== undefined) {
    yield delay(500);
  }
  yield put(requestSettlements());
}

export function* FetchSettlementAfterFiltersChangeSaga(): Generator {
  yield takeLatest(
    [
      SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
      SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
      CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
      CLEAR_SETTLEMENTS_FILTER_STATE,
      SET_SETTLEMENTS_FILTER_VALUE,
      CLEAR_SETTLEMENTS_FILTERS,
    ],
    fetchSettlementAfterFiltersChange,
  );
}

function* fetchSettlementDetails(action: PayloadAction<Settlement>) {
  try {
    yield call(apis.settlement.read, { settlementId: action.payload.id });
    yield put(setSettlementDetails(getSettlementDetails(action.payload)));
  } catch (e) {
    yield put(setSettlementDetailsError(e.message));
  }
}

export function* FetchSettlementDetailsSaga(): Generator {
  yield takeLatest(SELECT_SETTLEMENT, fetchSettlementDetails);
}

function* fetchSettlementDetailPositions(action: PayloadAction<SettlementDetail>) {
  try {
    yield call(apis.settlementsDetailPositions.read, {
      settlementId: action.payload.settlementId,
      detailId: action.payload.id,
    });
    yield put(setSettlementDetailPositions(getSettlementDetailPositions(action.payload)));
  } catch (e) {
    yield put(setSettlementDetailPositionsError(e.message));
  }
}

export function* FetchSettlementDetailPositionsSaga(): Generator {
  yield takeLatest(SELECT_SETTLEMENT_DETAIL, fetchSettlementDetailPositions);
}

export default function* rootSaga(): Generator {
  yield all([
    FetchSettlementsSaga(),
    FetchSettlementDetailsSaga(),
    FetchSettlementDetailPositionsSaga(),
    FetchSettlementAfterFiltersChangeSaga(),
    FinalizeSettlementSaga(),
  ]);
}
