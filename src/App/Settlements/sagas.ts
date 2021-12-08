import { strict as assert } from 'assert';
import { PayloadAction } from '@reduxjs/toolkit';
import apis from 'utils/apis';
import { all, call, put, select, takeLatest, delay } from 'redux-saga/effects';
import { v4 as uuidv4 } from 'uuid';
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
  LedgerParticipant,
  REQUEST_SETTLEMENTS,
  SELECT_SETTLEMENTS_FILTER_DATE_RANGE,
  SELECT_SETTLEMENTS_FILTER_DATE_VALUE,
  SET_SETTLEMENTS_FILTER_VALUE,
  VALIDATE_SETTLEMENT_REPORT,
  Settlement,
  SettlementParticipant,
  SettlementParticipantAccount,
  SettlementReport,
  SettlementReportValidationKind,
  SettlementStatus,
} from './types';
import {
  setFinalizeSettlementError,
  setSettlementFinalizingInProgress,
  setFinalizingSettlement,
  setSettlementAdjustments,
  setSettlementReportValidationInProgress,
  setSettlements,
  setSettlementReportValidationErrors,
  setSettlementReportValidationWarnings,
  setSettlementsError,
  requestSettlements,
} from './actions';
import {
  getFinalizeProcessFundsInOut,
  getFinalizeProcessNdcDecreases,
  getFinalizeProcessNdcIncreases,
  getFinalizingSettlement,
  getSettlementAdjustments,
  getSettlementReport,
  getSettlementsFilters,
} from './selectors';
import {
  ApiResponse,
  buildFiltersParams,
  buildUpdateSettlementStateRequest,
  mapApiToModel,
  SettlementFinalizeData,
  finalizeDataUtils,
  validateReport,
} from './helpers';

class FinalizeSettlementAssertionError extends Error {
  data: FinalizeSettlementError;

  constructor(data: FinalizeSettlementError) {
    super();
    this.data = data;
  }
}

function* processAdjustments({
  settlement,
  adjustments,
  newState,
  adjustNdc,
  adjustLiquidityAccountBalance,
}: {
  settlement: Settlement;
  adjustments: Adjustment[];
  newState: SettlementStatus;
  adjustNdc: { increases: boolean; decreases: boolean };
  adjustLiquidityAccountBalance: boolean;
}) {
  const results: FinalizeSettlementProcessAdjustmentsError[] = [];
  for (let i = 0; i < adjustments.length; i++) {
    const adjustment = adjustments[i];
    // TODO: we need state order here and in the display later. It might pay to make
    // SettlementStatus a union type. Like
    //   type SettlementStatus = { state: 'ABORTED', order: 0 } | { state: 'PENDING_SETTLEMENT', order: 1 } | ...etc.
    const stateOrder = [
      SettlementStatus.Aborted,
      SettlementStatus.PendingSettlement,
      SettlementStatus.PsTransfersRecorded,
      SettlementStatus.PsTransfersReserved,
      SettlementStatus.PsTransfersCommitted,
      SettlementStatus.Settling,
      SettlementStatus.Settled,
    ];
    const currentState = adjustment.settlementParticipantAccount.state;
    const statePosition = stateOrder.indexOf(currentState);
    const newStatePosition = stateOrder.indexOf(newState);
    assert(
      statePosition !== -1 && newStatePosition !== -1,
      `Runtime error determining relative order of settlement participant account states ${newState}, ${currentState}`,
    );
    // If the settlement account state is already past the target state, then we'll do nothing
    // and exit here, returning null;
    if (statePosition >= newStatePosition) {
      break;
    }
    if (
      (adjustNdc.increases && adjustment.currentLimit.value < adjustment.settlementBankBalance) ||
      (adjustNdc.decreases && adjustment.currentLimit.value > adjustment.settlementBankBalance)
    ) {
      const request = {
        participantName: adjustment.participant.name,
        body: {
          currency: adjustment.positionAccount.currency,
          limit: {
            ...adjustment.currentLimit,
            value: adjustment.settlementBankBalance,
          },
        },
      };
      const ndcResult: ApiResponse = yield call(apis.participantLimits.update, request);
      if (ndcResult.status !== 200) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.SET_NDC_FAILED,
          value: {
            adjustment,
            error: ndcResult.data,
            request,
          },
        });
        break;
      }
    }

    const description = `Business Operations Portal settlement ID ${settlement.id} finalization report processing`;
    // We can't make a transfer of zero amount, so we have nothing to do. In this case, we can
    // just skip the remaining steps.
    if (adjustment.amount === 0 || !adjustLiquidityAccountBalance) {
      // TODO: this is duplicated from below, is there a tidy way to rearrange the logic here?
      // Set the settlement participant account to the new state
      const request = {
        settlementId: settlement.id,
        participantId: adjustment.settlementParticipant.id,
        accountId: adjustment.settlementParticipantAccount.id,
        body: {
          state: newState,
          reason: description,
        },
      };
      const spaResult = yield call(apis.settlementParticipantAccount.update, request);
      if (spaResult.status !== 200) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED,
          value: {
            adjustment,
            error: spaResult.data,
            request,
          },
        });
        break;
      }
      break;
    }

    if (adjustment.amount > 0) {
      // Make the call to process funds out, then poll the balance until it's reduced
      const request = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        body: {
          externalReference: description,
          action: 'recordFundsIn',
          reason: description,
          amount: {
            amount: Math.abs(adjustment.amount),
            // TODO: I think the transfer fails if currency is missing, but it is advertised as
            // optional in the spec: https://github.com/mojaloop/central-ledger/blob/f0268fe56c76cc73f254d794ad09eb50569d5b58/src/api/interface/swagger.json#L1428
            currency: adjustment.settlementAccount.currency,
          },
          transferId: uuidv4(),
        },
      };
      const fundsInResult: ApiResponse = yield call(apis.participantAccount.create, request);
      if (fundsInResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsInResult.data,
            request,
          },
        });
        break;
      }
    } else {
      // Make the call to process funds out, then poll the balance until it's reduced
      const transferId = uuidv4();
      const fundsOutPrepareReserveRequest = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        body: {
          externalReference: description,
          action: 'recordFundsOutPrepareReserve',
          reason: description,
          amount: {
            amount: Math.abs(adjustment.amount),
            currency: adjustment.settlementAccount.currency,
          },
          transferId,
        },
      };
      const fundsOutPrepareReserveResult: ApiResponse = yield call(
        apis.participantAccount.create,
        fundsOutPrepareReserveRequest,
      );
      if (fundsOutPrepareReserveResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsOutPrepareReserveResult.data,
            request: fundsOutPrepareReserveRequest,
          },
        });
        break;
      }
      const fundsOutCommitRequest = {
        participantName: adjustment.participant.name,
        accountId: adjustment.settlementAccount.id,
        transferId,
        body: {
          action: 'recordFundsOutCommit',
          reason: description,
        },
      };
      const fundsOutCommitResult: ApiResponse = yield call(
        apis.participantAccountTransfer.update,
        fundsOutCommitRequest,
      );
      if (fundsOutCommitResult.status !== 202) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.FUNDS_PROCESSING_FAILED,
          value: {
            adjustment,
            error: fundsOutCommitResult.data,
            request: fundsOutCommitRequest,
          },
        });
        break;
      }
    }

    // Poll for a while to confirm the new balance
    const POLL_ATTEMPTS = 5;
    for (let j = 0; j < POLL_ATTEMPTS; j++) {
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
          results.push({
            type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_INCORRECT,
            value: {
              adjustment,
            },
          });
          break;
        }
        const request = {
          settlementId: settlement.id,
          participantId: adjustment.settlementParticipant.id,
          accountId: adjustment.settlementParticipantAccount.id,
          body: {
            state: newState,
            reason: description,
          },
        };
        // Set the settlement participant account to the new state
        const spaResult = yield call(apis.settlementParticipantAccount.update, request);
        if (spaResult.status !== 200) {
          results.push({
            type: FinalizeSettlementProcessAdjustmentsErrorKind.SETTLEMENT_PARTICIPANT_ACCOUNT_UPDATE_FAILED,
            value: {
              adjustment,
              error: spaResult.data,
              request,
            },
          });
          break;
        }
        break;
      }
      const wasLastAttempt = j + 1 === POLL_ATTEMPTS;
      if (wasLastAttempt) {
        results.push({
          type: FinalizeSettlementProcessAdjustmentsErrorKind.BALANCE_UNCHANGED,
          value: {
            adjustment,
          },
        });
      }
    }
  }
  return results;
}

function* collectSettlementFinalizeData(report: SettlementReport, settlement: Settlement) {
  // TODO: parallelize requests in this function. Probably by throwing the function out entirely
  // and using an async version with Promise.all. That lets us reuse the code elsewhere, and means
  // we don't have to put up with the limitations of redux-saga.
  // Why get limits? We need to get limits before we can set limits, because `alarmPercentage` is a
  // required field when we set a limit, and we don't want to change that here.
  const {
    transformParticipantsLimits,
    ensureResponse,
    getParticipantsAccounts,
    getAccountsParticipants,
    getSettlementParticipantAccounts,
    getSettlementParticipants,
    getAccountsPositions,
  } = finalizeDataUtils;
  const participantsLimits = transformParticipantsLimits(
    ensureResponse(yield call(apis.participantsLimits.read, {}), 200, 'Failed to retrieve participants limits'),
  );

  const switchParticipants = ensureResponse(
    yield call(apis.participants.read, {}),
    200,
    'Failed to retrieve participants',
  );
  const participantsAccounts = getParticipantsAccounts(switchParticipants);
  const accountsParticipants = getAccountsParticipants(switchParticipants);

  // Get the participants current positions such that we can determine which will decrease and
  // which will increase
  const accountsPositions: Map<AccountId, AccountWithPosition> = getAccountsPositions(
    (yield all(
      report.entries.map(function* getParticipantAccount({ positionAccountId }) {
        const participantName = accountsParticipants.get(positionAccountId)?.participant.name;
        assert(participantName, `Couldn't find participant for account ${positionAccountId}`);
        const result = yield call(apis.participantAccounts.read, { participantName });
        return [participantName, result];
      }),
    )).flatMap(([participantName, result]: [FspName, ApiResponse]) =>
      ensureResponse(result, 200, `Failed to retrieve accounts for participant ${participantName}`),
    ),
  );

  const settlementParticipantAccounts = getSettlementParticipantAccounts(settlement.participants);

  const settlementParticipants = getSettlementParticipants(settlement.participants);

  return {
    participantsLimits,
    accountsParticipants,
    participantsAccounts,
    accountsPositions,
    settlementParticipantAccounts,
    settlementParticipants,
  };
}

function buildAdjustments(
  report: SettlementReport,
  {
    participantsLimits,
    accountsParticipants,
    participantsAccounts,
    accountsPositions,
    settlementParticipantAccounts,
    settlementParticipants,
  }: SettlementFinalizeData,
): Adjustment[] {
  return report.entries.map(({ positionAccountId, balance: settlementBankBalance }): Adjustment => {
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
    // We use the negative settlement account balance because the switch presents a credit
    // balance as a negative.
    const switchBalance = -settlementAccount.value;
    assert(switchBalance !== undefined, `Failed to retrieve position for account ${settlementAccountId}`);
    const amount = settlementBankBalance - switchBalance;

    const settlementParticipantAccount = settlementParticipantAccounts.get(positionAccountId);
    assert(
      settlementParticipantAccount !== undefined,
      `Failed to retrieve settlement participant account for account ${positionAccountId}`,
    );

    const settlementParticipant = settlementParticipants.get(settlementParticipantAccount.id);
    assert(
      settlementParticipant !== undefined,
      `Failed to retrieve settlement participant for account ${positionAccountId}`,
    );

    return {
      settlementBankBalance,
      participant,
      amount,
      positionAccount,
      settlementAccount,
      currentLimit,
      settlementParticipantAccount,
      settlementParticipant,
    };
  });
}

function* validateSettlementReport(): any {
  // TODO: timeout
  const [settlement, report] = yield all([select(getFinalizingSettlement), select(getSettlementReport)]);

  // TODO: much of this data would be useful throughout the portal, perhaps hoist it up and
  // make it available everywhere. This might also mean we can validate the report more when we
  // ingest it.
  const finalizeData: SettlementFinalizeData = yield call(collectSettlementFinalizeData, report, settlement);

  console.log('validating report');
  const errorKinds = [
    SettlementReportValidationKind.AccountIsIncorrectType,
    SettlementReportValidationKind.ExtraAccountsPresentInReport,
    SettlementReportValidationKind.InvalidAccountId,
    SettlementReportValidationKind.NewBalanceAmountInvalid,
    SettlementReportValidationKind.ReportIdentifiersNonMatching,
    SettlementReportValidationKind.SettlementIdNonMatching,
    SettlementReportValidationKind.TransferAmountInvalid,
  ];
  const reportValidations = validateReport(report, finalizeData, settlement);
  const errors = [...reportValidations.values()].filter((val) => errorKinds.includes(val.kind));
  const warnings = [...reportValidations.values()].filter((val) => !errorKinds.includes(val.kind));
  console.log('validated report', reportValidations);
  yield put(setSettlementReportValidationErrors(errors));
  yield put(setSettlementReportValidationWarnings(warnings));

  const adjustments = buildAdjustments(report, finalizeData);

  console.log('adjustments', adjustments);

  const [debits, credits] = adjustments.reduce(
    ([dr, cr], adj) => (adj.amount < 0 ? [[...dr, adj], cr] : [dr, [...cr, adj]]),
    [[], []],
  );

  console.log(debits, credits);

  yield put(setSettlementReportValidationInProgress(false));
  yield put(setSettlementAdjustments({ debits: [...debits.values()], credits: [...credits.values()] }));
}

function* finalizeSettlement(action: PayloadAction<Settlement>) {
  // TODO: timeout
  const settlement = action.payload;
  const { debits, credits } = yield select(getSettlementAdjustments);
  console.log(debits, credits);
  try {
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
        .every((a: SettlementParticipantAccount) => accountParticipantMap.has(a.id)),
      'Expected every account id present in settlement to be returned by GET /participants',
    );

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
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED,
            value: result.data,
          }),
        );
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersReserved: {
        console.log(SettlementStatus.PsTransfersReserved);

        const adjustNdc = {
          increases: yield select(getFinalizeProcessNdcIncreases),
          decreases: yield select(getFinalizeProcessNdcDecreases),
        };

        const debtorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(processAdjustments, {
          settlement,
          adjustments: [...debits.values()],
          newState: SettlementStatus.PsTransfersCommitted,
          adjustNdc,
          adjustLiquidityAccountBalance: yield select(getFinalizeProcessFundsInOut),
        });

        console.log('debtorsErrors', debtorsErrors);

        assert(
          debtorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: debtorsErrors,
          }),
        );

        const creditorsErrors: FinalizeSettlementProcessAdjustmentsError[] = yield call(processAdjustments, {
          settlement,
          adjustments: [...credits.values()],
          newState: SettlementStatus.PsTransfersCommitted,
          adjustNdc,
          adjustLiquidityAccountBalance: yield select(getFinalizeProcessFundsInOut),
        });

        console.log('creditorsErrors', creditorsErrors);

        assert(
          creditorsErrors.length === 0,
          new FinalizeSettlementAssertionError({
            type: FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS,
            value: creditorsErrors,
          }),
        );

        const newSettlement: { status: number; data: Omit<Settlement, 'totalValue'> } = yield call(
          apis.settlement.read,
          {
            settlementId: settlement.id,
          },
        );
        assert.strictEqual(newSettlement.status, 200, `Failed to retrieve settlement state`);

        const unprocessedStates: SettlementStatus[] = [
          SettlementStatus.PendingSettlement,
          SettlementStatus.PsTransfersRecorded,
          SettlementStatus.PsTransfersReserved,
        ];
        const requests = newSettlement.data.participants.flatMap((p) =>
          p.accounts
            .filter((a) => unprocessedStates.includes(a.state))
            .filter((a) => a.netSettlementAmount.amount === 0)
            .map((a: SettlementParticipantAccount) => ({
              request: {
                settlementId: settlement.id,
                participantId: p.id,
                accountId: a.id,
                body: {
                  state: SettlementStatus.Settled,
                  reason: `Business operations portal settlement ${settlement.id} finalization report processing`,
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
            type: FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED,
            value: accountSettlementErrors,
          }),
        );

        // These are accounts that are in an "unprocessed" state, i.e. their state is before
        // PS_TRANSFERS_COMMITTED and they have a non-zero net settlement amount.
        const unprocessableAccounts = newSettlement.data.participants.flatMap((p) =>
          p.accounts
            .filter((a) => unprocessedStates.includes(a.state))
            .filter((a) => a.netSettlementAmount.amount !== 0),
        );

        if (unprocessableAccounts.length > 0) {
          // TODO: need to tell the user something
          yield put(setSettlementFinalizingInProgress(false));
          return;
        }
      }
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.PsTransfersCommitted:
        console.log(SettlementStatus.PsTransfersCommitted);
      // We could transition to PS_TRANSFERS_COMMITTED, but then we'd immediately transition to
      // SETTLING anyway, so we do nothing here.
      // eslint-ignore-next-line: no-fallthrough
      case SettlementStatus.Settling: {
        console.log(SettlementStatus.Settling);
        yield put(
          setFinalizingSettlement({
            ...settlement,
            state: SettlementStatus.Settling,
          }),
        );

        const requests = settlement.participants.flatMap((p: SettlementParticipant) =>
          p.accounts
            .filter((a: SettlementParticipantAccount) => a.state !== SettlementStatus.Settled)
            .map((a: SettlementParticipantAccount) => ({
              request: {
                settlementId: settlement.id,
                participantId: p.id,
                accountId: a.id,
                body: {
                  state: SettlementStatus.Settled,
                  reason: `Business operations portal settlement ${settlement.id} finalization report processing`,
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
        // TODO: this can fail, there should be a retry limit. In fact, should we be polling? Does
        // the settlement state not change immediately?
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
        throw new FinalizeSettlementAssertionError({
          type: FinalizeSettlementErrorKind.ABORTED_SETTLEMENT,
        });
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = settlement.state;
        throw new Error(`Unhandled settlement status: ${exhaustiveCheck}`);
      }
    }
    yield put(setSettlementFinalizingInProgress(false));
  } catch (err) {
    console.error(err);
    yield put(setSettlementFinalizingInProgress(false));
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
    const params = buildFiltersParams(filters);
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
      yield put(setSettlements(response.data.map(mapApiToModel)));
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

export function* ValidateSettlementReportSaga(): Generator {
  yield takeLatest(VALIDATE_SETTLEMENT_REPORT, validateSettlementReport);
}

export default function* rootSaga(): Generator {
  yield all([
    FetchSettlementsSaga(),
    FetchSettlementAfterFiltersChangeSaga(),
    FinalizeSettlementSaga(),
    ValidateSettlementReportSaga(),
  ]);
}
