import React, { FC } from 'react';
import { Column, Modal, Row } from 'components';
import { connect } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { TransferDetail } from '../types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import './TransferDetails.css';

const stateProps = (state: State) => ({
  transferDetails: selectors.getSelectedTransfer(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => dispatch(actions.transferDetailsModalClose()),
});

interface ConnectorProps {
  transferDetails: TransferDetail;
  onModalCloseClick: () => void;
}

const TransferDetails: FC<ConnectorProps> = ({ transferDetails, onModalCloseClick }) => {
  if (transferDetails) {
    let y = 1;
    if (y) {
      y = 0;
    }
  }
  return (
    <Modal title="Transfer Details" width="1200px" onClose={onModalCloseClick} flex>
      <Row align="flex-start flex-start">
        <Column></Column>
        <Column grow="0"></Column>
      </Row>
    </Modal>
  );
};

export default connect(stateProps, dispatchProps)(TransferDetails);
