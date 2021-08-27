import { strict as assert } from 'assert';
import React, { FC } from 'react';
import { ErrorBox, Modal, Spinner, DataList } from 'components';
import connector, { ConnectorProps } from './connectors';
import { SettlementStatus, FinalizeSettlementError, FinalizeSettlementErrorKind } from '../types';

import './SettlementFinalizingModal.css';

const SettlementFinalizingModal: FC<ConnectorProps> = ({
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
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
        // TODO: why does this have an error when every case is handled?
        // const exhaustiveCheck: never = err.type;
        // throw new Error(`Unhandled error state: ${exhaustiveCheck}`);
        throw new Error('Unhandled error state');
      }
    }
  }

  assert(finalizingSettlement, 'Expected finalizing settlement. This should be an unreachable state.');

  const content = finalizingSettlementError ? (
    <ErrorBox>
      <div>'Errors finalizing settlement'</div>
      {computeErrorDetails}
    </ErrorBox>
  ) : (
    <div className="finalizing-settlement">
      <div>{`Finalizing settlement: ${finalizingSettlement.id}.`}</div>
      <br />
      <div>{`State: ${finalizingSettlement.state}.`}</div>
      <br />
      {finalizingSettlement.state !== SettlementStatus.Settled && <Spinner size={20} />}
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
