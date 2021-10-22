import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import * as selectors from './selectors';
import * as actions from './actions';
import { SettlementWindow, DateRanges, FilterValue } from './types';
import { ReduxContext } from 'store';

const stateProps = (state: State) => ({
  selectedSettlementWindow: selectors.getSelectedSettlementWindow(state),
  settlementWindows: selectors.getSettlementWindows(state),
  settlementWindowsError: selectors.getSettlementWindowsError(state),
  isSettlementWindowsPending: selectors.getIsSettlementWindowsPending(state),

  filters: selectors.getSettlementWindowsFilters(state),
  checkedSettlementWindows: selectors.getCheckedSettlementWindows(state),
  isSettlementWindowModalVisible: selectors.getIsSettlementWindowModalVisible(state),
  isCloseSettlementWindowPending: selectors.getIsCloseSettlementWindowPending(state),
  isSettleSettlementWindowPending: selectors.getIsSettleSettlementWindowPending(state),
  settleSettlementWindowsError: selectors.getSettleSettlementWindowsError(state),
  settlingWindowsSettlementId: selectors.getSettlingWindowsSettlementId(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => {
    dispatch(actions.resetSettlementWindows());
    dispatch(actions.requestSettlementWindows());
  },

  onDateRangerFilterSelect: (payload: DateRanges) => dispatch(actions.selectSettlementWindowsFilterDateRange(payload)),
  onDateFilterClearClick: () => dispatch(actions.clearSettlementWindowsFilterDateRange()),
  onStateFilterClearClick: () => dispatch(actions.clearSettlementWindowsFilterState()),
  onStartDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementWindowsFilterDateValue({ type: 'start', value: payload })),
  onEndDateRangeFilterSelect: (payload: number) =>
    dispatch(actions.selectSettlementWindowsFilterDateValue({ type: 'end', value: payload })),
  onFilterValueChange: (filter: string, value: FilterValue) =>
    dispatch(actions.setSettlementWindowsFilterValue({ filter, value })),
  onClearFiltersClick: () => dispatch(actions.clearSettlementWindowsFilters()),
  onSettlementsWindowsCheck: (items: SettlementWindow[]) => dispatch(actions.checkSettlementWindows(items)),
  onSettleButtonClick: (windows: SettlementWindow[]) => dispatch(actions.settleSettlementWindows(windows)),
  onCloseButtonClick: (settlementWindow: SettlementWindow) =>
    dispatch(actions.requestCloseSettlementWindow(settlementWindow)),
  onCloseModalClick: () => dispatch(actions.closeSettlementWindowModal()),
});

const connector = connect(stateProps, dispatchProps, null, { context: ReduxContext });

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
