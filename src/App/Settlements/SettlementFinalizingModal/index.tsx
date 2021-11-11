import { strict as assert } from 'assert';
import React, { FC } from 'react';
import { Button, ErrorBox, Modal, Spinner, DataList } from 'components';
import connector, { ConnectorProps } from './connectors';
import { SettlementStatus, FinalizeSettlementError, FinalizeSettlementErrorKind } from '../types';

import './SettlementFinalizingModal.css';

const SettlementFinalizingModal: FC<ConnectorProps> = ({
  settlementReport,
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
  onProcessButtonClick,
  onSelectSettlementReport,
}) => {
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
        return <DataList columns={columns} list={list} sortColumn="Participant" sortAsc={true} />;
      }
      default: {
        // Did you get a compile error here? This code is written such that if every
        // case in the above switch state is not handled, compilation will fail.
        const exhaustiveCheck: never = err;
        throw new Error(`Unhandled error state: ${exhaustiveCheck}`);
      }
    }
  }

  assert(finalizingSettlement, 'Expected finalizing settlement. This should be an unreachable state.');

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

  const content = finalizingSettlementError ? (
    <ErrorBox>
      <div>'Errors finalizing settlement'</div>
      {computeErrorDetails}
    </ErrorBox>
  ) : (
    <div>
      <input type="file" onChange={onSelectSettlementReport} />
      <Button
        kind="secondary"
        noFill
        size="s"
        label="Process"
        enabled={settlementReport !== null}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
          e.stopPropagation();
          if (settlementReport !== null) {
            console.log('Settlement report non-null');
            console.log(settlementReport);
            onProcessButtonClick(settlementReport, finalizingSettlement);
            // const wb = new ExcelJS.Workbook();
            // console.log(wb);
            // wb.xlsx.load(settlementReport).then(() => {
            //   // yield call(wb.xlsx.load, reportFile);
            //   console.log('Loaded settlement report into workbook');
            //   console.log(wb);
            //   const ws = wb.getWorksheet(1);
            //   console.log('Loaded worksheet maybe');
            //   console.log(ws);
            //   const report = {
            //     settlementId: ws.getCell('C3'),
            //     contents: ws.getRows(7, Infinity),
            //   };
            //   console.log(report);
            // });
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
      isCloseEnabled={endStates.includes(finalizingSettlement.state) || finalizingSettlementError}
      flex
    >
      {content}
    </Modal>
  );
};

export default connector(SettlementFinalizingModal);
