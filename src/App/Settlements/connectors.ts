import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import * as selectors from './selectors';
import * as actions from './actions';
import { Settlement, DateRanges, FilterValue } from './types';

const stateProps = (state: State) => ({
  selectedSettlement: selectors.getSelectedSettlement(state),
  settlements: selectors.getSettlements(state),
  settlementsError: selectors.getSettlementsError(state),
  finalizingSettlement: selectors.getFinalizingSettlement(state),
  isSettlementsPending: selectors.getIsSettlementsPending(state),

  filters: selectors.getSettlementsFilters(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestSettlements()),

  onFinalizeButtonClick: (settlement: Settlement) => dispatch(actions.finalizeSettlement(settlement)),
  onDateRangerFilterSelect: (payload: DateRanges) => dispatch(actions.selectSettlementsFilterDateRange(payload)),
  onDateFilterClearClick: () => dispatch(actions.clearSettlementsFilterDateRange()),
  onStateFilterClearClick: () => dispatch(actions.clearSettlementsFilterState()),
  onStartDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'start', value: payload })),
  onEndDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementsFilterDateValue({ type: 'end', value: payload })),
  onFilterValueChange: (filter: string, value: FilterValue) =>
    dispatch(actions.setSettlementsFilterValue({ filter, value })),
  onClearFiltersClick: () => dispatch(actions.clearSettlementsFilters()),
  onSettlementSelect: (settlement: Settlement) => dispatch(actions.selectSettlement(settlement)),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
