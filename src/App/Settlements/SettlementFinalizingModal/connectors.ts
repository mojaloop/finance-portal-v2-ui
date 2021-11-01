import { connect, ConnectedProps } from 'react-redux';
import { ReduxContext } from 'store';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';

const stateProps = (state: State) => ({
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  finalizingSettlementError: selectors.getFinalizingSettlementError(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => {
    // TODO: this should all be folded into a single discriminated union that represents the state
    // of settlement finalizing. This might mean that the finalizeSettlement saga calls itself
    // repeatedly as the settlement state transitions.
    dispatch(actions.setFinalizingSettlement(null));
    dispatch(actions.setFinalizeSettlementError(null));
    dispatch(actions.hideFinalizeSettlementModal());
    dispatch(actions.requestSettlements());
  },
});

const connector = connect(stateProps, dispatchProps, null, { context: ReduxContext });

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
