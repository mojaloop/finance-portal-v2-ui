import { strict as assert } from 'assert';
import { PayloadAction } from '@reduxjs/toolkit';
import ExcelJS from 'exceljs';
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
  FinalizeSettlementError,
  FinalizeSettlementErrorKind,
  Settlement,
  SettlementDetail,
  SettlementStatus,
  LedgerParticipant,
  LedgerAccount,
  SettlementParticipant,
  SettlementPositionAccount,
} from './types';
import {
  setFinalizeSettlementError,
  setFinalizingSettlement,
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

class FinalizeSettlementAssertionError extends Error {
  data: FinalizeSettlementError;

  constructor(data: FinalizeSettlementError) {
    super();
    this.data = data;
  }
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

function readFileAsArrayBuffer(file: File): PromiseLike<ArrayBuffer> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    // TODO: better investigate usage of 'as ArrayBuffer'
    reader.onload = () => res(reader.result as ArrayBuffer);
    reader.onerror = rej;
    reader.readAsArrayBuffer(file);
  });
}

interface SettlementReport {
  settlementId: number;
  entries: {
    participant: {
      id: number;
      name: string;
    };
    accountId: number;
    balance: number;
    transferAmount: number;
  }[];
}

function loadWorksheetData(buf: ArrayBuffer): PromiseLike<SettlementReport> {
  return new Promise((res) => {
    const wb = new ExcelJS.Workbook();
    wb.xlsx.load(buf).then(() => {
      const SETTLEMENT_ID_CELL = 'C1';
      const PARTICIPANT_INFO_COL = 'A';
      const BALANCE_COL = 'C';
      const TRANSFER_AMOUNT_COL = 'D';

      const ws = wb.getWorksheet(1);
      const settlementIdText = ws.getCell(SETTLEMENT_ID_CELL).text;
      const settlementId = Number(settlementIdText);
      assert(
        settlementId,
        `Unable to extract settlement ID from cell ${SETTLEMENT_ID_CELL}. Found: ${settlementIdText}`,
      );

      const startOfData = 7;
      let endOfData = 7;
      while (ws.getCell(`A${endOfData}`).text !== '') {
        endOfData += 1;
      }

      const entries =
        ws.getRows(7, endOfData - startOfData)?.map((r) => {
          const participantInfoCellContent = r.getCell(PARTICIPANT_INFO_COL).text;
          const [idText, accountIdText, name] = participantInfoCellContent.split(' ');
          const [id, accountId] = [Number(idText), Number(accountIdText)];
          assert(
            id && accountId && name,
            `Unable to extract participant ID, account ID and participant name from ${PARTICIPANT_INFO_COL}${r.number}. Cell contents: [${participantInfoCellContent}]`,
          );

          const balanceText = r.getCell(BALANCE_COL).text;
          const balance = Number(balanceText);
          assert(
            balance,
            `Unable to extract account balance from ${BALANCE_COL}${r.number}. Cell contents: [${balanceText}]`,
          );

          const isNegative = /^\(\d+\)\)$/;
          const transferAmountText = r.getCell(TRANSFER_AMOUNT_COL).text.replace(',', '');
          const transferAmount = isNegative.test(transferAmountText)
            ? -Number(transferAmountText.replace(/(^\(|\)$)/g, ''))
            : Number(transferAmountText);
          assert(
            transferAmount,
            `Unable to extract transfer amount from ${BALANCE_COL}${r.number}. Cell contents: [${balanceText}]`,
          );

          return {
            participant: {
              id,
              name,
            },
            accountId,
            balance,
            transferAmount,
          };
        }) || [];

      res({
        settlementId,
        entries,
      });
    });
  });
}

function* finalizeSettlement(action: PayloadAction<{ settlement: Settlement; report: File }>) {
  // TODO: timeout
  const { settlement, report: reportFile } = action.payload;
  try {
    const fileBuf = yield call(readFileAsArrayBuffer, reportFile);
    console.log(fileBuf);
    const data = yield call(loadWorksheetData, fileBuf);
    console.log(data);
    // const rows = reader.worksheets[0].getRows(0, Infinity);
    // console.log(rows);
    switch (settlement.state) {
      case SettlementStatus.PendingSettlement: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PendingSettlement,
          }),
        );
        const result = yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersRecorded),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersRecorded: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PsTransfersRecorded,
          }),
        );
        const result = yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersReserved),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersReserved: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PsTransfersReserved,
          }),
        );
        const result = yield call(
          apis.settlement.update,
          buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersCommitted),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersCommitted:
      // We could transition to PS_TRANSFERS_COMMITTED, but then we'd immediately transition to
      // SETTLING anyway, so we do nothing here.
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.Settling: {
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settling,
          }),
        );

        const participantsResult = yield call(apis.participants.read, {});
        const participants: LedgerParticipant[] = participantsResult.data;
        const accountParticipantMap: Map<LedgerAccount['id'], LedgerParticipant> = new Map(
          participants
            .filter((p: LedgerParticipant) => p.name !== 'Hub' && p.name !== 'hub')
            .flatMap((p: LedgerParticipant) => p.accounts.map(({ id }) => [id, p])),
        );

        // Ensure we have participant info for every account in our settlement. This ensures the
        // result of accountParticipantsMap.get will not be undefined for any of our accounts. It
        // lets us safely use accountParticipantsMap.get without checking the result.
        assert(
          settlement.participants
            .flatMap((p: SettlementParticipant) => p.accounts)
            .every((a: SettlementPositionAccount) => accountParticipantMap.has(a.id)),
          'Expected every account id present in settlement to be returned by GET /participants',
        );

        const requests = settlement.participants.flatMap((p: SettlementParticipant) =>
          p.accounts
            .filter((a: SettlementPositionAccount) => a.state !== SettlementStatus.Settled)
            .map((a: SettlementPositionAccount) => ({
              request: {
                settlementId: settlement.id,
                participantId: p.id,
                accountId: a.id,
                body: {
                  state: SettlementStatus.Settled,
                  reason: 'Business operations portal request',
                },
              },
              account: a,
            })),
        );
        const accountSettlementResults: { status: number; data: any }[] = yield all(
          requests.map((r) => call(apis.settlementParticipantAccount.update, r.request)),
        );
        const requestResultZip = accountSettlementResults.map((res, i) => ({
          req: requests[i],
          res,
        }));
        const accountSettlementErrors = requestResultZip
          .filter(({ res }) => res.status !== 200)
          .map(({ req, res }) => {
            return {
              participant: <LedgerParticipant>accountParticipantMap.get(req.account.id),
              apiResponse: res.data.errorInformation,
              account: req.account,
            };
          });
        assert.strictEqual(
          accountSettlementErrors.length,
          0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SETTLE_ACCOUNTS,
            value: accountSettlementErrors,
          }),
        );

        let result: { data: Settlement; status: number } = yield call(apis.settlement.read, {
          settlementId: settlement.id,
        });
        while (result.data.state !== SettlementStatus.Settled) {
          yield delay(5000);
          result = yield call(apis.settlement.read, { settlementId: settlement.id });
        }
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.Settled:
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settled,
          }),
        );
        break;
      case SettlementStatus.Aborted:
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settled,
          }),
        );
        break;
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = settlement.state;
        throw new Error(`Unhandled settlement status: ${exhaustiveCheck}`);
      }
    }
  } catch (err) {
    if (!(err instanceof FinalizeSettlementAssertionError)) {
      throw err;
    }
    yield put(setFinalizeSettlementError(err.data));
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
