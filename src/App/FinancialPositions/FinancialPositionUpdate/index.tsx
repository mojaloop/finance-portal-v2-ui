import React, { ChangeEvent, FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { DataLabel, Modal, Row, Select, RadioGroup } from '../../../components';
import { State, Dispatch } from '../../../store/types';
import * as selectors from '../selectors';
import * as actions from '../actions';
import './FinancialPositionUpdate.css';
import { FinancialPositionsUpdateAction, fundsOptions, updateOptions } from '../types';
import FinancialPositionUpdateConfirm from '../FinancialPositionUpdateConfirm';

const stateProps = (state: State) => ({
  isSubmitPending: selectors.getIsFinancialPositionUpdateSubmitPending(state),
  isCancelEnabled: selectors.getIsFinancialPositionUpdateCancelEnabled(state),
  isShowUpdateFinancialPositionConfirmModal: selectors.getIsShowUpdateFinancialPositionConfirmModal(state),
  isUpdateNDCModal: selectors.getIsUpdateFinancialPositionNDCAfterConfirmModal(state),

  selectedFinancialPosition: selectors.getSelectedFinancialPosition(state),
  selectedUpdateAction: selectors.getSelectedFinancialPositionUpdateAction(state),
  updateAmount: selectors.getFinancialPositionUpdateAmount(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  setUpdateAmount: (amount: string) => dispatch(actions.setFinancialPositionUpdateAmount(amount)),
  setUpdateAction: (act: FinancialPositionsUpdateAction) => dispatch(actions.setFinancialPositionUpdateAction(act)),

  onCloseModalClick: () => dispatch(actions.closeFinancialPositionUpdateModal()),
  onSubmitModalClick: () => dispatch(actions.showFinancialPositionUpdateConfirmModal()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

const FinancialPositionUpdate: FC<ConnectorProps> = ({
  isSubmitPending,
  isCancelEnabled,
  isShowUpdateFinancialPositionConfirmModal,
  isUpdateNDCModal,

  selectedFinancialPosition,
  selectedUpdateAction,
  updateAmount,

  setUpdateAmount,
  setUpdateAction,
  onCloseModalClick,
  onSubmitModalClick,
}) => {
  const dfspName = selectedFinancialPosition?.dfsp?.name;

  const handleOnChangeAmount = (e: ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!Number(val)) val = val.substring(0, val.length - 1);
    e.target.value = val;
    setUpdateAmount(val);
  };

  return (
    <div>
      <Modal
        id="el-modal__update_participant"
        title="Update Participant"
        width="500px"
        allowCancel
        allowSubmit
        allowClose={false}
        isCancelEnabled={isCancelEnabled}
        isSubmitEnabled={updateAmount && selectedUpdateAction}
        isSubmitPending={isSubmitPending}
        onCancel={onCloseModalClick}
        onSubmit={onSubmitModalClick}
        submitButtonId="btn__submit_update_participant"
        flex
      >
        <Row style={{ marginBottom: '20px' }}>
          <DataLabel bold>What would you like to do for {dfspName}?</DataLabel>
        </Row>
        <Row style={{ marginBottom: '5px' }}>
          <DataLabel>Action</DataLabel>
        </Row>
        <Row style={{ marginBottom: '30px' }}>
          {isUpdateNDCModal ? (
            <Select
              id="select__action"
              label="Action"
              placeholder="Change Net Debit Cap"
              value={FinancialPositionsUpdateAction.ChangeNetDebitCap}
              options={{
                [FinancialPositionsUpdateAction.ChangeNetDebitCap]: FinancialPositionsUpdateAction.ChangeNetDebitCap,
              }}
              onChange={setUpdateAction}
              disabled={true}
            />
          ) : (
            <Select
              id="select__action"
              label="Action"
              placeholder="Select Action..."
              value={selectedUpdateAction}
              options={updateOptions}
              onChange={setUpdateAction}
              disabled={isSubmitPending}
            />
          )}
        </Row>
        {/* Display RadioGroup only in case any selected action 'Add / Withdraw Funds' */}
        {(selectedUpdateAction === FinancialPositionsUpdateAction.AddWithdrawFunds ||
          selectedUpdateAction === FinancialPositionsUpdateAction.AddFunds ||
          selectedUpdateAction === FinancialPositionsUpdateAction.WithdrawFunds) && (
          <Row style={{ marginBottom: '10px' }}>
            <RadioGroup
              id="select__add_withdraw_funds"
              value={selectedUpdateAction}
              options={fundsOptions}
              onChange={setUpdateAction}
              disabled={isSubmitPending}
            />
          </Row>
        )}
        {/* Display Amount only in case any action selected */}
        {selectedUpdateAction && (
          <div>
            <Row style={{ marginBottom: '5px' }}>
              <DataLabel>Amount</DataLabel>
            </Row>
            <Row>
              <input
                type="text"
                id="input__amount"
                name="input__amount"
                placeholder="Enter Amount..."
                maxLength={50}
                value={updateAmount}
                onChange={handleOnChangeAmount}
                disabled={
                  !selectedUpdateAction ||
                  selectedUpdateAction === FinancialPositionsUpdateAction.AddWithdrawFunds ||
                  isSubmitPending
                }
              />
            </Row>
          </div>
        )}
      </Modal>
      <>{isShowUpdateFinancialPositionConfirmModal && <FinancialPositionUpdateConfirm />}</>
    </div>
  );
};

export default connector(FinancialPositionUpdate);
