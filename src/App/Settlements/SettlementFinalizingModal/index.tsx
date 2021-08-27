import React, { FC } from 'react';
import { ErrorBox, Modal, Spinner } from 'components';
import connector, { ConnectorProps } from './connectors';
import { SettlementStatus, FinalizeSettlementError, FinalizeSettlementErrorKind } from '../types';

import './SettlementFinalizingModal.css';

const SettlementFinalizingModal: FC<ConnectorProps> = ({
  finalizingSettlement,
  finalizingSettlementError,
  onModalCloseClick,
}) => {
  function computeErrorMessage(err: FinalizeSettlementError) {
    switch (err.type) {
      // TODO: suggest remedial action to the user
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_COMMITTED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RECORDED:
      case FinalizeSettlementErrorKind.SET_SETTLEMENT_PS_TRANSFERS_RESERVED: {
        return `${err.type}: ${err.value.errorDescription} [CODE: ${err.value.errorCode}]`;
      }
      case FinalizeSettlementErrorKind.SETTLE_ACCOUNTS: {
        // TODO:
        // - table
        // - use the account information etc. available to us
        const details = err.value
          .map((v) => `For participant: ${v.participant.name}. Error: ${v.apiResponse.errorDescription}.`)
          .join('\n');
        return `${err.type}:\n${details}`;
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
  const content = finalizingSettlementError ? (
    <ErrorBox>{`Error finalizing settlement: ${computeErrorMessage(finalizingSettlementError)}`}</ErrorBox>
  ) : (
    <div className="finalizing-settlement">
      <div>{`Finalizing settlement: ${finalizingSettlement?.id}.`}</div>
      <br />
      <div>{`State: ${finalizingSettlement?.state}.`}</div>
      <br />
      {finalizingSettlement?.state !== SettlementStatus.Settled && <Spinner size={20} />}
    </div>
  );

  return (
    <Modal
      title={`Finalizing settlement ${finalizingSettlement?.id}`}
      width="1200px"
      onClose={onModalCloseClick}
      isCloseEnabled={finalizingSettlement?.state === SettlementStatus.Settled || finalizingSettlementError}
      flex
    >
      {content}
    </Modal>
  );
};

export default connector(SettlementFinalizingModal);
