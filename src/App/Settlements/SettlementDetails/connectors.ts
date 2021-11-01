import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { getDfsps } from 'App/DFSPs/selectors';
import { ReduxContext } from 'store';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { Settlement, SettlementDetail } from '../types';

const stateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlement: selectors.getSelectedSettlement(state) as Settlement,
  settlementDetails: selectors.getSettlementDetails(state),
  settlementDetailsError: selectors.getSettlementDetailsError(state),
  isSettlementDetailsPending: selectors.getIsSettlementDetailsPending(state),
  selectedSettlementDetail: selectors.getSelectedSettlementDetail(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onSelectSettlementDetail: (item: SettlementDetail) => dispatch(actions.selectSettlementDetail(item)),
  onModalCloseClick: () => dispatch(actions.closeSettlementDetailsModal()),
});

const connector = connect(stateProps, dispatchProps, null, { context: ReduxContext });

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
