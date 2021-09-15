import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import * as selectors from './selectors';
import * as actions from './actions';
import { FinancialPosition } from './types';

const stateProps = (state: State) => ({
  financialPositions: selectors.getFinancialPositions(state),
  financialPositionsError: selectors.getFinancialPositionsError(state),
  isFinancialPositionsPending: selectors.getIsFinancialPositionsPending(state),

  selectedFinancialPosition: selectors.getSelectedFinancialPosition(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestFinancialPositions()),
  onSelectFinancialPosition: (item: FinancialPosition) => dispatch(actions.selectFinancialPosition(item)),
  onToggleCurrencyActive: (item: FinancialPosition) => dispatch(actions.toggleCurrencyActive(item)),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
