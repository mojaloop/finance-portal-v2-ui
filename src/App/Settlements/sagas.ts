import { strict as assert } from 'assert';
import { PayloadAction } from '@reduxjs/toolkit';
import apis from 'utils/apis';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';
import { Currency } from '../types';
import {
  AccountId,
  AccountWithPosition,
  Adjustment,
  CLEAR_SETTLEMENTS_FILTER_DATE_RANGE,
  CLEAR_SETTLEMENTS_FILTERS,
  CLEAR_SETTLEMENTS_FILTER_STATE,
  FINALIZE_SETTLEMENT,
  FinalizeSettlementError,
  FinalizeSettlementErrorKind,
  FinalizeSettlementProcessAdjustmentsError,
  FinalizeSettlementProcessAdjustmentsErrorKind,
  FspName,
  LedgerAccount,
  LedgerAccountType,
  LedgerParticipant,
  Limit,
  REQUEST_SETTLEMENTS,
  SELECT_SETTLEMENT,
  SELECT_SETTLEMENT_DETAIL,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  SET_SETTLEMENTS_FILTER_VALUE,
  Settlement,
  SettlementDetail,
  SettlementParticipant,
  SettlementPositionAccount,
  SettlementReport,
  SettlementStatus,
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
import { getSettlementDetailPositions } from './_mockData';

class FinalizeSettlementAssertionError extends Error {
  data: FinalizeSettlementError;

  constructor(data: FinalizeSettlementError) {
    super();
    this.data = data;
  }
}

interface ApiResponse {
  status: number;
  data: any;
}
function ensureResponse(response: ApiResponse, status: number, msg: string) {
  assert.equal(response.status, status, msg);
  return response.data;
}

function transformParticipantsLimits(
  limits: { name: FspName; currency: Currency; limit: Limit }[],
): Map<FspName, Map<Currency, Limit>> {
  return limits.reduce((result, e) => {
    if (result.get(e.name)?.set(e.currency, e.limit) === undefined) {
      result.set(e.name, new Map([[e.currency, e.limit]]));
    }
    return result;
  }, new Map<FspName, Map<Currency, Limit>>());
}

interface AccountParticipant {
  participant: LedgerParticipant;
  account: LedgerAccount;
}
type AccountsParticipants = Map<AccountId, AccountParticipant>;
function getAccountsParticipants(participants: LedgerParticipant[]): AccountsParticipants {
  return participants
    .filter((fsp) => !/hub/i.test(fsp.name))
    .reduce(
      (result, fsp) => fsp.accounts.reduce((map, acc) => map.set(acc.id, { participant: fsp, account: acc }), result),
      new Map<AccountId, AccountParticipant>(),
    );
}

type ParticipantsAccounts = Map<FspName, Map<Currency, Map<LedgerAccountType, AccountParticipant>>>;

function getParticipantsAccounts(participants: LedgerParticipant[]): ParticipantsAccounts {
  return participants
    .filter((fsp) => !/hub/i.test(fsp.name))
    .reduce(
      (result, fsp) =>
        fsp.accounts.reduce((map, acc) => {
          const leaf = { participant: fsp, account: acc };
          const fspNode = map.get(fsp.name);
          if (fspNode) {
            const currencyNode = fspNode.get(acc.currency);
            if (currencyNode) {
              currencyNode.set(acc.ledgerAccountType, leaf);
              return map;
            }
            fspNode.set(acc.currency, new Map([[acc.ledgerAccountType, leaf]]));
            return map;
          }
          return map.set(fsp.name, new Map([[acc.currency, new Map([[acc.ledgerAccountType, leaf]])]]));
        }, result),
      new Map<FspName, Map<Currency, Map<LedgerAccountType, AccountParticipant>>>(),
    );
}

function* processAdjustments(settlement: Settlement, adjustments: Adjustment[]) {
  const results: (FinalizeSettlementProcessAdjustmentsError | 'OK')[] = yield all(
    adjustments.map((adjustment) => {
      return call(function* processAdjustment() {
        const ndcResult: ApiResponse = yield call(apis.participantLimits.update, {
          participantName: adjustment.participant.name,
          body: {
            currency: adjustment.positionAccount.currency,
            limit: {
              ...adjustment.currentLimit,
              value: adjustment.settlementBankBalance,
            },
          },
        });
        if (ndcResult.status !== 200) {
          return {
            type: FinalizeSettlementProcessAdjustmentsErrorKind.SET_NDC_FAILED,
            value: {
              adjustment,
              error: ndcResult.data,
            },
          };
        }

        // We can't make a transfer of zero amount, so we have nothing to do. In this case, we can
        // just skip the remaining steps.
        if (adjustment.amount === 0) {
          return 'OK';
        }
        // Make the call to process funds out, then poll the balance until it's reduced
        const description = `Business Operations Portal settlement ID ${settlement.id} finalization report processing`;
        const fundsInOutResult: ApiResponse = yield call(apis.participantAccount.create, {
          participantName: adjustment.participant.name,
          accountId: adjustment.settlementAccount.id,
          body: {
            externalReference: description,
            action: adjustment.amount > 0 ? 'recordFundsIn' : 'recordFundsOutPrepareReserve',
            reason: description,
            amount: {
              amount: Math.abs(adjustment.amount), // TODO: MLNumber
              // TODO: I think the transfer fails if currency is missing, but it is advertised as
              // optional in the spec: https://github.com/mojaloop/central-ledger/blob/f0268fe56c76cc73f254d794ad09eb50569d5b58/src/api/interface/swagger.json#L1428
              currency: adjustment.settlementAccount.currency,
            },
            transferId: uuidv4(),
          },
        });
        if (fundsInOutResult.status !== 202) {
          return {
            type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
            value: {
              adjustment,
              error: fundsInOutResult.data,
            },
          };
        }

        for (let i = 0; i < 5; i++) {
          const SECONDS = 1000;
          yield delay(2 * SECONDS);
          const newBalanceResult: ApiResponse = yield call(apis.participantAccounts.read, {
            participantName: adjustment.participant.name,
            accountId: adjustment.settlementAccount.id,
          });

          // If the call fails, we'll just try again- so don't handle a failure status code
          const newBalance = newBalanceResult?.data?.find(
            (acc: AccountWithPosition) => acc.id === adjustment.settlementAccount.id,
          )?.value;

          if (newBalanceResult.status === 200 && newBalance && newBalance !== adjustment.settlementAccount.value) {
            // We use "negative" newBalance because the switch returns a negative value for credit
            // balances. The switch doesn't have a concept of debit balances for settlement
            // accounts.
            if (-newBalance !== adjustment.settlementBankBalance) {
              return {
                type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_INCORRECT,
                value: {
                  adjustment,
                },
              };
            }
            return 'OK';
          }
        }
        return {
          type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_UNCHANGED,
          value: {
            adjustment,
          },
        };
      });
    }),
  );
  return results.filter((res) => res !== 'OK');
}

interface SettlementFinalizeData {
  participantsLimits: Map<FspName, Map<Currency, Limit>>;
  accountsParticipants: Map<AccountId, AccountParticipant>;
  participantsAccounts: ParticipantsAccounts;
  accountsPositions: Map<AccountId, AccountWithPosition>;
}

function* collectSettlementFinalizeData(report: SettlementReport) {
  // TODO: parallelize requests in this function
  // We need to get limits before we can set limits, because `alarmPercentage` is a required
  // field when we set a limit, and we don't want to change that here.
  const participantsLimits = transformParticipantsLimits(
    ensureResponse(yield call(apis.participantsLimits.read, {}), 200, 'Failed to retrieve participants limits'),
  );
  console.log(participantsLimits);
  const participantsAccountsRaw = ensureResponse(
    yield call(apis.participants.read, {}),
    200,
    'Failed to retrieve participants',
  );
  const participantsAccounts = getParticipantsAccounts(participantsAccountsRaw);
  const accountsParticipants = getAccountsParticipants(participantsAccountsRaw);
  console.log(accountsParticipants);

  // Get the participants current positions such that we can determine which will decrease and
  // which will increase
  const accountsPositions: Map<AccountId, AccountWithPosition> = (yield all(
    report.entries.map(function* getParticipantAccount({ positionAccountId }) {
      const participantName = accountsParticipants.get(positionAccountId)?.participant.name;
      assert(participantName, `Couldn't find participant for account ${positionAccountId}`);
      const result = yield call(apis.participantAccounts.read, { participantName });
      return [participantName, result];
    }),
  ))
    .flatMap(([participantName, result]: [FspName, ApiResponse]) =>
      ensureResponse(result, 200, `Failed to retrieve accounts for participant ${participantName}`),
    )
    .reduce(
      (map: Map<AccountId, AccountWithPosition>, acc: AccountWithPosition) => map.set(acc.id, acc),
      new Map<AccountId, AccountWithPosition>(),
    );

  console.log(accountsPositions);

  return {
    participantsLimits,
    accountsParticipants,
    participantsAccounts,
    accountsPositions,
  };
}

function buildAdjustments(
  report: SettlementReport,
  { participantsLimits, accountsParticipants, participantsAccounts, accountsPositions }: SettlementFinalizeData,
): Adjustment[] {
  return report.entries.map(
    // TODO: amount, settlementBankBalance, etc. should be MLNumbers
    ({ positionAccountId, balance: settlementBankBalance }): Adjustment => {
      const accountParticipant = accountsParticipants.get(positionAccountId);
      assert(accountParticipant !== undefined, `Failed to retrieve participant for account ${positionAccountId}`);
      const { participant } = accountParticipant;
      const positionAccount = accountsPositions.get(positionAccountId);
      assert(positionAccount !== undefined, `Failed to retrieve position for account ${positionAccountId}`);
      const { currency } = positionAccount;
      const currentLimit = participantsLimits.get(participant.name)?.get(currency);
      assert(
        currentLimit !== undefined,
        `Failed to retrieve limit for participant ${participant.name} currency ${currency}`,
      );
      const settlementAccountId = participantsAccounts.get(participant.name)?.get(currency)?.get('SETTLEMENT')
        ?.account?.id;
      assert(settlementAccountId, `Failed to retrieve ${currency} settlement account for ${participant.name}`);
      const settlementAccount = accountsPositions.get(settlementAccountId);
      assert(settlementAccount, `Failed to retrieve ${currency} settlement account for ${participant.name}`);
      assert(
        settlementAccount.currency === positionAccount.currency,
        `Unexpected data validation error: position account and settlement account currencies are not equal for ${participant.name}. This is most likely a bug.`,
      );
      // TODO: Mojaloop arithmetic?
      // We use the negative settlement account balance because the switch presents a credit
      // balance as a negative.
      const switchBalance = -settlementAccount.value;
      assert(switchBalance !== undefined, `Failed to retrieve position for account ${settlementAccountId}`);
      const amount = settlementBankBalance - switchBalance;
      // TODO: uncomment before release
      // assert.equal(
      //   reportParticipant.name,
      //   participant.name,
      //   `Report participant ${reportParticipant.name} did not match switch participant ${participant.name} for account ${accountId}`,
      // );
      return {
        settlementBankBalance,
        participant,
        amount,
        positionAccount,
        settlementAccount,
        currentLimit,
      };
    },
  );
}

function* finalizeSettlement(action: PayloadAction<{ settlement: Settlement; report: SettlementReport }>) {
  // TODO: timeout
  const { settlement, report } = action.payload;
  try {
    // TODO: is there a problem here when the settlement bank transfer amounts don't correspond
    // correctly to the netSettlementAmount? I.e. when the position accounts are adjusted, will
    // they subsequently be correct? I expect so, because this is merely saying "this set of
    // transfers is no longer relevant to the position account", and the NDC and
    // settlement/liquidity account balances are decoupled from the position account.
    //
    // Process in this order:
    // 0. ensure all settlement participant accounts are in PS_TRANSFERS_RESERVED
    // 1. apply the new debit NDCs
    // 2. process the debit funds out, reducing the debtors liquidity account balances
    // 3. process the credit funds in, increasing the creditors liquidity account balances
    // 4. progress the settlement state to PS_TRANSFERS_COMMITTED, this will modify the creditors
    //    positions by the corresponding net settlement amounts
    // 5. apply the new credit NDCs
    // Because (2) and (4) do not have any effect on the ability of a participant to make transfers
    // but (1) and (5) reduce the switch's exposure to unfunded transfers and (3) and (6) increase the
    // switch's exposure to unfunded transfers, if a partial failure of this process occurs,
    // processing in this order means we're least likely to leave the switch in a risky state.

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
          helpers.buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersRecorded),
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
          helpers.buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersReserved),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersReserved: {
        const finalizeData: SettlementFinalizeData = yield call(collectSettlementFinalizeData, report);

        const adjustments = buildAdjustments(report, finalizeData);

        console.log(adjustments);

        const [debits, credits] = adjustments.reduce(
          ([dr, cr], adj) => (adj.amount < 0 ? [dr.add(adj), cr] : [dr, cr.add(adj)]),
          [new Set<Adjustment>(), new Set<Adjustment>()],
        );

        console.log(debits, credits);

        const debtorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(processAdjustments, settlement, [
          ...debits.values(),
        ]);

        console.log(debtorsErrors);

        assert(
          debtorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: debtorsErrors,
          }),
        );

        const creditorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(
          processAdjustments,
          settlement,
          [...credits.values()],
        );

        console.log(creditorsErrors);

        assert(
          creditorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: creditorsErrors,
          }),
        );

        // TODO: the remainder of this state change should probably be per-account, rather than the
        // whole settlement at once
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.PsTransfersReserved,
          }),
        );
        const result = yield call(
          apis.settlement.update,
          helpers.buildUpdateSettlementStateRequest(settlement, SettlementStatus.PsTransfersCommitted),
        );
        assert.strictEqual(
          result.status,
          200,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED,
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
    console.error(err);
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
    yield put(setSettlementDetails(action.payload));
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
