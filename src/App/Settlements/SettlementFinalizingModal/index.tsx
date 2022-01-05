import { strict as assert } from 'assert';
import React, { FC, useState } from 'react';
import { Button, ErrorBox, Modal, Spinner } from 'components';
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
  settlementReportValidationInProgress,
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
  onProcessButtonClick,
  onValidateButtonClick,
  onSelectSettlementReport,
  onSettlementReportProcessingError,
  settlementReportError,
  onSetNetDebitCapIncreasesChange,
  onSetNetDebitCapDecreasesChange,
  onSetFundsInOutChange,
  processFundsInOut,
  processNdcIncreases,
  processNdcDecreases,
  settlementReportValidationErrors,
  settlementReportValidationWarnings,
  onClearSettlementReportWarnings,
}) => {
  const [controller, setController] = useState<AbortController | undefined>(undefined);

  function computeErrorDetails(err: FinalizeSettlementError) {
    switch (err.type) {
      case FinalizeSettlementErrorKind.ABORTED_SETTLEMENT:
        return <div>Unable to finalize an aborted settlement.</div>;
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED: {
        return (
          <div>
            `${err.type}: ${err.value.errorDescription} [CODE: ${err.value.errorCode}]`
          </div>
        );
      }
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED:
      case FinalizeSettlementErrorKind.SETTLE_ACCOUNTS: {
        const rows = err.value.map((v) => (
          <tr key={hash(v)}>
            <td>{v.participant.name}</td>
            <td>{v.apiResponse.errorDescription}</td>
            <td>{v.apiResponse.errorCode}</td>
            <td>{v.account.netSettlementAmount.currency}</td>
            <td>{v.account.netSettlementAmount.amount}</td>
            <td>{v.account.state}</td>
            <td>{v.account.id}</td>
          </tr>
        ));
        return (
          <table className="finalize-error-list">
            <caption>Errors in settlement state change</caption>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Error</th>
                <th>Code</th>
                <th>Currency</th>
                <th>Amount</th>
                <th>State</th>
                <th>Account ID</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
        );
      }
      case FinalizeSettlementErrorKind.PROCESS_ADJUSTMENTS: {
        const rows = err.value.map((v) => (
          <tr key={hash(v)}>
            <td>{v.type}</td>
            <td>{v.value.adjustment.participant.name}</td>
            <td>{v.value.adjustment.positionAccount.id}</td>
            <td>{v.value.adjustment.settlementAccount.id}</td>
          </tr>
        ));
        return (
          <table className="finalize-error-list">
            <caption>Errors during settlement finalization</caption>
            <thead>
              <tr>
                <th>Message</th>
                <th>Participant</th>
                <th>Position Account ID</th>
                <th>Settlement Account ID</th>
              </tr>
            </thead>
            <tbody>{rows}</tbody>
          </table>
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

  function computeStateCharacter(displayState: SettlementStatus, currentState: SettlementStatus, animating: boolean) {
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

    if (currentStatePosition >= displayStatePosition) {
      return done;
    }

    if (currentStatePosition + 1 === displayStatePosition && animating) {
      return inProgress;
    }

    return pending;
  }

  const content = finalizingSettlementError ? ( // eslint-disable-line no-nested-ternary
    <ErrorBox>{computeErrorDetails(finalizingSettlementError)}</ErrorBox>
  ) : settlementReportError ? ( // eslint-disable-line no-nested-ternary
    <ErrorBox>
      <div>Error validating report:</div>
      {settlementReportError}
      <div>Please review the report format and content and try again.</div>
    </ErrorBox>
  ) : settlementReportValidationErrors !== null && settlementReportValidationErrors.length > 0 ? (
    <ErrorBox>
      <div>
        <h3>The following errors were present in the settlement finalization report:</h3>
        {settlementReportValidationErrors.map((e: SettlementReportValidation) => (
          <div key={hash(e)}>{displaySettlementReportValidation(e)}</div>
        ))}
      </div>
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
      <label htmlFor="set-process-net-debit-cap-decreases">
        <input
          id="set-process-net-debit-cap-decreases"
          type="checkbox"
          disabled={settlementFinalizingInProgress}
          checked={processNdcDecreases}
          onChange={onSetNetDebitCapDecreasesChange}
        />
        <i>Decrease</i> net debit caps to balance values in settlement finalization report
      </label>
      <br />
      <label htmlFor="set-process-net-debit-cap-increases">
        <input
          id="set-process-net-debit-cap-increases"
          type="checkbox"
          disabled={settlementFinalizingInProgress}
          checked={processNdcIncreases}
          onChange={onSetNetDebitCapIncreasesChange}
        />
        <i>Increase</i> net debit caps to balance values in settlement finalization report
      </label>
      <br />
      <Button
        pending={settlementReportValidationInProgress}
        kind="secondary"
        noFill
        size="s"
        label="Validate"
        disabled={settlementReport === null || settlementFinalizingInProgress}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (settlementReport !== null) {
            onValidateButtonClick();
          }
        }}
      />
      {settlementReportValidationErrors?.length === 0 ? <>&nbsp;✅</> : <></>}
      <br />
      <Button
        pending={settlementFinalizingInProgress}
        kind="secondary"
        noFill
        size="s"
        label="Process"
        disabled={
          settlementReport === null ||
          settlementFinalizingInProgress ||
          settlementReportValidationErrors === null ||
          finalizingSettlement.state === 'SETTLED'
        }
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (settlementReport !== null) {
            onProcessButtonClick(finalizingSettlement);
          }
        }}
      />
      <hr />
      <table>
        <tbody>
          {orderedStates.map((s) => (
            <tr className="settlement-state-item" key={s}>
              <td>{computeStateCharacter(s, finalizingSettlement.state, settlementFinalizingInProgress)}</td>
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
      {settlementReportValidationWarnings?.length &&
      settlementReportValidationWarnings?.length > 0 &&
      settlementReportValidationErrors?.length === 0 ? (
        <Modal title="Settlement Report Validation Warnings" width="1200px" onClose={onClearSettlementReportWarnings}>
          <ErrorBox>
            <div>
              <h3>Warning: the following was found in the settlement finalization report:</h3>
              <hr />
              {settlementReportValidationWarnings?.map((e: SettlementReportValidation) => (
                <div key={hash(e)}>{displaySettlementReportValidation(e)}</div>
              ))}
              <hr />
              <h3>These are not fatal errors. After closing this dialog, it will be possible to process the report.</h3>
            </div>
          </ErrorBox>
        </Modal>
      ) : (
        <></>
      )}
    </Modal>
  );
};
SettlementFinalizingModal.displayName = 'SettlementFinalizingModal';

export default connector(SettlementFinalizingModal);
