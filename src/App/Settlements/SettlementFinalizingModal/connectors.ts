import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { Settlement, SettlementReport } from '../types';

const stateProps = (state: State) => ({
  settlementReport: selectors.getSettlementReport(state),
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
    // Clear the settlement report such that the operator does not open another settlement and have
    // the settlement report pre-loaded with the wrong file. We perform validation on the
    // settlement report that is uploaded, but this could cause confusion for the operator.
    dispatch(actions.setSettlementReport(null));
    dispatch(actions.hideFinalizeSettlementModal());
    dispatch(actions.requestSettlements());
  },
  onProcessButtonClick: (report: SettlementReport, settlement: Settlement) =>
    dispatch(actions.finalizeSettlement({ report, settlement })),
  onSelectSettlementReport: (report: SettlementReport) => dispatch(actions.setSettlementReport(report || null)),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
