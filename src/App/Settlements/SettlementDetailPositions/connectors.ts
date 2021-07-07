import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { getDfsps } from 'App/DFSPs/selectors';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { SettlementDetail } from '../types';

const stateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlementDetail: selectors.getSelectedSettlementDetail(state) as SettlementDetail,
  settlementDetailPositions: selectors.getSettlementDetailPositions(state),
  settlementDetailPositionsError: selectors.getSettlementDetailPositionsError(state),
  isSettlementDetailPositionsPending: selectors.getIsSettlementDetailPositionsPending(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onSelectSettlementDetail: (item: SettlementDetail) => dispatch(actions.selectSettlementDetail(item)),
  onModalCloseClick: () => dispatch(actions.closeSettlementDetailPositionsModal()),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
