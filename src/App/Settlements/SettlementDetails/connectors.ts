import { connect, ConnectedProps } from 'react-redux';
import { State, Dispatch } from 'store/types';
import { getDfsps } from 'App/DFSPs/selectors';
import * as actions from '../actions';
import * as selectors from '../selectors';

const stateProps = (state: State) => ({
  dfsps: getDfsps(state),
  selectedSettlement: selectors.getSelectedSettlement(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onModalCloseClick: () => dispatch(actions.selectSettlement(null)),
});

const connector = connect(stateProps, dispatchProps);

export type ConnectorProps = ConnectedProps<typeof connector>;

export default connector;
