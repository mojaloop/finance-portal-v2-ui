import { strict as assert } from 'assert';
import React, { FC, useState } from 'react';
import { Button, ErrorBox, Modal, Spinner, DataList } from 'components';
import { MD5 as hash } from 'object-hash';
import connector, { ConnectorProps } from './connectors';
import {
  readFileAsArrayBuffer,
  deserializeReport,
  generateSettlementReportValidationDetail,
  explainSettlementReportValidationKind,
} from '../helpers';
import {
  FinalizeSettlementError,
  FinalizeSettlementErrorKind,
  SettlementReportValidation,
  SettlementReportValidationKind,
  SettlementStatus,
} from '../types';

import './SettlementFinalizingModal.css';

function displaySettlementReportValidation(v: SettlementReportValidation) {
  const detail = generateSettlementReportValidationDetail(v);
  return (
    <div>
      <b>{`Description: ${v.kind}`}</b>
      {detail && <p>{`Detail: ${generateSettlementReportValidationDetail(v)}`}</p>}
      <p>{`Explanation: ${explainSettlementReportValidationKind(v.kind)}`}</p>
    </div>
  );
}

const SettlementFinalizingModal: FC<ConnectorProps> = ({
  settlementReport,
  settlementFinalizingInProgress,
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
  onProcessButtonClick,
  onSelectSettlementReport,
  onSettlementReportProcessingError,
  settlementReportError,
  onSetNetDebitCapChange,
  onSetFundsInOutChange,
  processFundsInOut,
  processNdc,
}) => {
  const [controller, setController] = useState<AbortController | undefined>(undefined);

  function computeErrorDetails(err: FinalizeSettlementError) {
    switch (err.type) {
      case FinalizeSettlementErrorKind.FINALIZE_REPORT_VALIDATION: {
        const errorKinds = [
          SettlementReportValidationKind.AccountIsIncorrectType,
          SettlementReportValidationKind.ExtraAccountsPresentInReport,
          SettlementReportValidationKind.InvalidAccountId,
          SettlementReportValidationKind.NewBalanceAmountInvalid,
          SettlementReportValidationKind.ReportIdentifiersNonMatching,
          SettlementReportValidationKind.SettlementIdNonMatching,
          SettlementReportValidationKind.TransferAmountInvalid,
        ];
        const errors = [...err.value.values()].filter(({ kind }) => errorKinds.includes(kind));
        const warnings = [...err.value.values()].filter(({ kind }) => !errorKinds.includes(kind));
        if (errors.length > 0) {
          return (
            <div>
              <h3>The following errors were present in the settlement finalization report:</h3>
              {errors.map((e) => (
                <div key={hash(e)}>{displaySettlementReportValidation(e)}</div>
              ))}
            </div>
          );
        }
        if (warnings.length === 0) {
          return <div>Runtime error displaying errors</div>;
        }
        return <></>;
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED: {
        return (
          <div>
            `${err.type}: ${err.value.errorDescription} [CODE: ${err.value.errorCode}]`
          </div>
        );
      }
      case FinalizeSettlementErrorKind.SETTLE_ACCOUNTS: {
        const columns = [
          { key: 'participantName', label: 'Participant' },
          { key: 'errorMessage', label: 'Error' },
          { key: 'errorCode', label: 'Code' },
          { key: 'currency', label: 'Currency' },
          { key: 'amount', label: 'Amount' },
          { key: 'state', label: 'State' },
          { key: 'accountId', label: 'Account ID' },
          { key: 'remediation', label: 'Remediation' },
        ];
        const list = err.value.map((v) => ({
          participantName: v.participant.name,
          errorMessage: v.apiResponse.errorDescription,
          errorCode: v.apiResponse.errorCode,
          currency: v.account.netSettlementAmount.currency,
          amount: v.account.netSettlementAmount.amount,
          state: v.account.state,
          accountId: v.account.id,
          remediation: 'TODO', // TODO
        }));
        return (
          <div>
            <div>Errors in settlement state change</div>
            <DataList columns={columns} list={list} sortColumn="Participant" sortAsc={true} />
          </div>
        );
      }
      case FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS: {
        const columns = [
          { key: 'type', label: 'Message' },
          { key: 'participantName', label: 'Participant' },
          { key: 'positionAccountId', label: 'Position Account ID' },
          { key: 'settlementAccountId', label: 'Settlement Account ID' },
        ];
        const list = err.value.map((v) => ({
          participantName: v.value.adjustment.participant.name,
          positionAccountId: v.value.adjustment.positionAccount.id,
          settlementAccountId: v.value.adjustment.settlementAccount.id,
          type: v.type,
        }));
        return (
          <div>
            <div>Error processing adjustments</div>
            <DataList flex={true} columns={columns} list={list} sortColumn="Participant" sortAsc={true} />
          </div>
        );
      }
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = err;
        throw new Error(`Unhandled error state: ${exhaustiveCheck}`);
      }
    }
  }

  assert(finalizingSettlement, 'Runtime assertion error: expected finalizing settlement.');

  const orderedStates = [
    SettlementStatus.PendingSettlement,
    SettlementStatus.PsTransfersRecorded,
    SettlementStatus.PsTransfersReserved,
    SettlementStatus.PsTransfersCommitted,
    SettlementStatus.Settling,
    SettlementStatus.Settled,
  ];

  function computeStateCharacter(displayState: SettlementStatus, currentState: SettlementStatus) {
    const done = (
      <span role="img" aria-label="completed">
        ✅
      </span>
    );
    const inProgress = <Spinner size={17} />;
    const pending = <div />;

    if (currentState === SettlementStatus.Settled) {
      return done;
    }

    const currentStatePosition = orderedStates.indexOf(currentState);
    const displayStatePosition = orderedStates.indexOf(displayState);

    if (currentStatePosition > displayStatePosition) {
      return done;
    }

    if (currentStatePosition === displayStatePosition) {
      return inProgress;
    }

    return pending;
  }

  // eslint-disable-next-line no-nested-ternary
  const content = finalizingSettlementError ? (
    <ErrorBox>{computeErrorDetails(finalizingSettlementError)}</ErrorBox>
  ) : settlementReportError ? (
    <ErrorBox>
      <div>Error validating report:</div>
      {settlementReportError}
      <div>Please review the report format and content and try again.</div>
    </ErrorBox>
  ) : (
    <div>
      <div>Please select a settlement finalization report to process:</div>
      <br />
      <input
        type="file"
        disabled={settlementFinalizingInProgress}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          // This is a little bit funky: we don't want to put any non-serializable state in the
          // store, but redux-saga makes this rather tricky. So we do this transformation here.
          // The problem with this is that the user could, for example, accidentally select a very
          // large file that spends a long time in readFileAsArrayBuffer. Upon noticing their
          // error, the user might then select a much smaller file, triggering this function again,
          // while the previous invocation is still busy in readFileAsArrayBuffer. So we handle
          // cancellation ourselves here.
          // TODO: test this; probably by extracting the function processSelectedReportFile
          if (controller !== undefined) {
            controller.abort();
          }
          const newController = new AbortController();
          setController(newController);
          if (e.target.files?.[0]) {
            // Use a lambda to close over the argument values at the time of calling
            (function processSelectedReportFile(signal, file) {
              return new Promise((resolve, reject) => {
                signal.addEventListener('abort', () => reject(new Error('aborted')));
                readFileAsArrayBuffer(file)
                  .then((fileBuf) => deserializeReport(fileBuf))
                  .then(resolve, reject);
              })
                .catch((err) => {
                  // if aborted, ignore, we're not bothered
                  if (err.message !== 'aborted') {
                    console.error(err);
                    onSettlementReportProcessingError(err.message);
                  }
                })
                .then(onSelectSettlementReport);
            })(newController.signal, e.target.files[0]);
          }
        }}
      />
      <br />
      <label htmlFor="set-process-funds-in-out">
        <input
          id="set-process-funds-in-out"
          type="checkbox"
          disabled={settlementFinalizingInProgress}
          checked={processFundsInOut}
          onChange={onSetFundsInOutChange}
        />
        Set liquidity account balance to balance values in settlement finalization report
      </label>
      <br />
      <label htmlFor="set-process-net-debit-cap">
        <input
          id="set-process-net-debit-cap"
          type="checkbox"
          disabled={settlementFinalizingInProgress}
          checked={processNdc}
          onChange={onSetNetDebitCapChange}
        />
        Set net debit cap to balance values in settlement finalization report
      </label>
      <br />
      <Button
        kind="secondary"
        noFill
        size="s"
        label="Process"
        disabled={settlementReport === null || settlementFinalizingInProgress}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (settlementReport !== null) {
            onProcessButtonClick(settlementReport, finalizingSettlement);
          }
        }}
      />
      <hr />
      <table>
        <tbody>
          {orderedStates.map((s) => (
            <tr key={s}>
              <td>{computeStateCharacter(s, finalizingSettlement.state)}</td>
              <td>{s}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <Modal
      title={`Finalizing settlement ${finalizingSettlement.id}`}
      width="1200px"
      onClose={onModalCloseClick}
      isCloseEnabled={!settlementFinalizingInProgress}
      flex
    >
      {content}
    </Modal>
  );
};

export default connector(SettlementFinalizingModal);
