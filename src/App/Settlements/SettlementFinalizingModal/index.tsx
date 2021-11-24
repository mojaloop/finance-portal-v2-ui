import { strict as assert } from 'assert';
import React, { FC, useState } from 'react';
import { Button, ErrorBox, Modal, Spinner, DataList } from 'components';
import connector, { ConnectorProps } from './connectors';
import { readFileAsArrayBuffer, deserializeReport } from '../helpers';
import { SettlementStatus, FinalizeSettlementError, FinalizeSettlementErrorKind } from '../types';

import './SettlementFinalizingModal.css';

const SettlementFinalizingModal: FC<ConnectorProps> = ({
  settlementReport,
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
  onProcessButtonClick,
  onSelectSettlementReport,
  onSettlementReportProcessingError,
  settlementReportError,
}) => {
  const [controller, setController] = useState<AbortController | undefined>(undefined);

  function computeErrorDetails(err: FinalizeSettlementError) {
    switch (err.type) {
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
      <input
        type="file"
        // disabled={true}
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
      <Button
        kind="secondary"
        noFill
        size="s"
        label="Process"
        disabled={settlementReport === null}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (settlementReport !== null) {
            onProcessButtonClick(settlementReport, finalizingSettlement);
          }
        }}
      />
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

  const endStates = [SettlementStatus.Settled, SettlementStatus.Aborted];

  return (
    <Modal
      title={`Finalizing settlement ${finalizingSettlement.id}`}
      width="1200px"
      onClose={onModalCloseClick}
      // TODO: this is wrong, the user can't exit the modal early. We only want to prevent them
      // exiting the modal _while_ we're processing. Try it out: if the settlement was created from
      // closed settlement windows in the UI, it will begin with its state in PS_TRANSFERS_RESERVED
      // and the user will not be able to exit the modal.
      isCloseEnabled={
        endStates.includes(finalizingSettlement.state) || finalizingSettlementError || settlementReportError
      }
      flex
    >
      {content}
    </Modal>
  );
};

export default connector(SettlementFinalizingModal);
