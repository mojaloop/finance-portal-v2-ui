import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DataLabel, Modal, Row, Column, Button } from '../../../components';
import { State, Dispatch } from '../../../store/types';
import * as selectors from '../selectors';
import * as actions from '../actions';
import './FinancialPositionUpdateConfirm.css';
import { FinancialPositionsUpdateAction } from '../types';

const stateProps = (state: State) => ({
  isSubmitPending: selectors.getIsFinancialPositionUpdateSubmitPending(state),

  selectedFinancialPosition: selectors.getSelectedFinancialPosition(state),
  selectedUpdateAction: selectors.getSelectedFinancialPositionUpdateAction(state),
  updateAmount: selectors.getFinancialPositionUpdateAmount(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onCloseModalClick: () => dispatch(actions.closeFinancialPositionUpdateConfirmModal()),
  onSubmitModalClick: () => dispatch(actions.submitFinancialPositionUpdateModal()),
  onSubmitModalAndUpdNDCClick: () => dispatch(actions.submitFinancialPositionUpdateConfirmModal()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

const FinancialPositionUpdateConfirm: FC<ConnectorProps> = ({
  isSubmitPending,
  selectedFinancialPosition,
  selectedUpdateAction,
  updateAmount,

  onCloseModalClick,
  onSubmitModalClick,
  onSubmitModalAndUpdNDCClick,
}) => {
  let act;
  if (selectedUpdateAction === FinancialPositionsUpdateAction.AddFunds) act = 'Add Funds';
  else if (selectedUpdateAction === FinancialPositionsUpdateAction.WithdrawFunds) act = 'Withdraw Funds';
  else if (selectedUpdateAction === FinancialPositionsUpdateAction.ChangeNetDebitCap) act = 'Change Net Debit Cap';

  const isNDC = selectedUpdateAction === FinancialPositionsUpdateAction.ChangeNetDebitCap;

  return (
    <Modal
      id="el-modal__confirm_update_participant"
      title="Confirm Action"
      width="650px"
      allowCancel
      allowSubmit
      allowClose={false}
      noFooter={true}
      flex
    >
      <Row align="center" style={{ marginTop: '20px', marginBottom: '50px' }}>
        <DataLabel bold>You are trying to do the following:</DataLabel>
      </Row>
      <Row align="center" className="central-row">
        <Column align="right">
          <DataLabel>Participant:</DataLabel>
          <DataLabel>Action:</DataLabel>
          <DataLabel>Amount:</DataLabel>
        </Column>
        <Column>
          <DataLabel id="confirm_update_participant_name" bold>
            {selectedFinancialPosition?.dfsp?.name}
          </DataLabel>
          <DataLabel id="confirm_update_participant_action" bold>
            {act}
          </DataLabel>
          <DataLabel id="confirm_update_participant_amount" bold>
            {updateAmount}
          </DataLabel>
        </Column>
      </Row>
      <Row style={{ marginTop: '50px' }}>
        <Column align="center">
          <DataLabel bold>Please Confirm this action below.</DataLabel>
          {!isNDC && <DataLabel bold>If you would also like to update the NDC,</DataLabel>}
          {!isNDC && <DataLabel bold>you can do that by clicking "Confirm and Update NDC"</DataLabel>}
        </Column>
      </Row>
      <div className="el-modal__footer">
        <div className="el-modal__footer-left" />
        <div className="el-modal__footer-right">
          <Button
            id="btn__cancel_confirm_upd_participant"
            onClick={onCloseModalClick}
            disabled={isSubmitPending}
            label="Cancel"
            icon="close-small"
            kind="secondary"
          />
          <Button
            id="btn__confirm_upd_participant"
            pending={isSubmitPending}
            icon="check-small"
            onClick={onSubmitModalClick}
            label={isNDC ? 'Confirm' : 'Confirm Only'}
            kind="primary"
            className="el-modal__submit"
          />
          <>
            {!isNDC && (
              <Button
                id="btn__confirm_upd_participant_and_upd_ndc"
                pending={isSubmitPending}
                icon="check-small"
                onClick={onSubmitModalAndUpdNDCClick}
                label="Confirm and Update NDC"
                kind="primary"
                className="el-modal__submit"
              />
            )}
          </>
        </div>
      </div>
    </Modal>
  );
};

export default connector(FinancialPositionUpdateConfirm);
