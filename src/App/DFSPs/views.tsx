import React, { FC } from 'react';
import { connect, ConnectedProps } from 'react-redux';
import { Spinner } from 'components';
import withMount from 'hocs';
import { State, Dispatch } from 'store/types';
import * as actions from './actions';
import * as selectors from './selectors';

const stateProps = (state: State) => ({
  isDfspsPending: selectors.getIsDfspsPending(state),
  dfsps: selectors.getDfsps(state),
});

const dispatchProps = (dispatch: Dispatch) => ({
  onMount: () => dispatch(actions.requestDfsps()),
});

const connector = connect(stateProps, dispatchProps);
type ConnectorProps = ConnectedProps<typeof connector>;

// export default connector;

interface DfspsProps {
  dfsps?: string;
  isDfspsPending: boolean;
}

const Dfsps: FC<DfspsProps> = ({ children, dfsps, isDfspsPending }) => {
  if (dfsps?.length === 0 || isDfspsPending) {
    return <Spinner center size={40} />;
  }
  return <>{children}</>;
};
export default connector(withMount(Dfsps, 'onMount'));
