import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import * as actions from '../actions';
import * as selectors from '../selectors';
import { Settlement, SettlementReport } from '../types';

const stateProps = (state: State) => ({
  settlementReport: selectors.getSettlementReport(state),
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  finalizingSettlementError: selectors.getFinalizingSettlementError(state),
  settlementReportError: selectors.getSettlementReportError(state),
  processFundsInOut: selectors.getFinalizeProcessFundsInOut(state),
  processNdcIncreases: selectors.getFinalizeProcessNdcIncreases(state),
  processNdcDecreases: selectors.getFinalizeProcessNdcDecreases(state),
  settlementFinalizingInProgress: selectors.getSettlementFinalizingInProgress(state),
  settlementReportValidationWarnings: selectors.getSettlementReportValidationWarnings(state),
  settlementReportValidationErrors: selectors.getSettlementReportValidationErrors(state),
  settlementReportValidationInProgress: selectors.getSettlementReportValidationInProgress(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => {
    // TODO: this should all be folded into a single discriminated union that represents the state
    // of settlement finalizing. This might mean that the finalizeSettlement saga repeatedly
    // dispatches actions that call the finalizeSettlement saga as the settlement state
    // transitions.
    dispatch(actions.setSettlementReportValidationErrors(null));
    dispatch(actions.setSettlementReportValidationWarnings(null));
    dispatch(actions.setSettlementAdjustments(null));
    dispatch(actions.setFinalizingSettlement(null));
    dispatch(actions.setFinalizeSettlementError(null));
    // Clear the settlement report such that the operator does not open another settlement and have
    // the settlement report pre-loaded with the wrong file. We perform validation on the
    // settlement report that is uploaded, but this could cause confusion for the operator.
    dispatch(actions.setSettlementReport(null));
    dispatch(actions.setSettlementReportError(null));
    dispatch(actions.hideFinalizeSettlementModal());
    dispatch(actions.requestSettlements());
  },
  onValidateButtonClick: () => {
    dispatch(actions.validateSettlementReport());
    dispatch(actions.setSettlementReportValidationInProgress(true));
  },
  onProcessButtonClick: (settlement: Settlement) => {
    dispatch(actions.setSettlementFinalizingInProgress(true));
    dispatch(actions.finalizeSettlement(settlement));
  },
  onSelectSettlementReport: (report: SettlementReport) => {
    dispatch(actions.setSettlementReportValidationErrors(null));
    dispatch(actions.setSettlementReportValidationWarnings(null));
    dispatch(actions.setSettlementReport(report || null));
  },
  onSettlementReportProcessingError: (err: string) => dispatch(actions.setSettlementReportError(err)),
  onSetFundsInOutChange: (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(actions.setFinalizeProcessFundsInOut(e.target.checked));
  },
  onSetNetDebitCapDecreasesChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(actions.setFinalizeProcessNdcDecreases(e.target.checked)),
  onSetNetDebitCapIncreasesChange: (e: React.ChangeEvent<HTMLInputElement>) =>
    dispatch(actions.setFinalizeProcessNdcIncreases(e.target.checked)),
  onClearSettlementReportWarnings: () => dispatch(actions.setSettlementReportValidationWarnings(null)),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
